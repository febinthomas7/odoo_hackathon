from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.hashers import make_password
import re

from assets.models import Admin, Department, Employee, AssetManager

class RoleBasedSignupView(APIView):
    """
    Handles POST requests to /api/<role>/signup/ using Custom 12-digit IDs
    Inserts data directly into the corresponding custom role table.
    """
    permission_classes = [] 
    authentication_classes = []

    # Map URL roles/prefixes to their exact Django Model
    ROLE_MODEL_MAP = {
        "admin": Admin, "ad": Admin,
        "department": Department, "dp": Department,
        "employee": Employee, "ep": Employee,
        "assetManager": AssetManager, "am": AssetManager
    }

    def post(self, request, role):
        # 1. Gather data from request payload
        provided_id = request.data.get("id") or request.data.get("username")
        password = request.data.get("password")
        name = request.data.get("name", "Unknown")
        
        # Capture optional additional fields that might be required by specific models
        extra_data = request.data.get("extra_fields", {}) 

        if not provided_id or not password:
            return Response(
                {"error": "Please provide both id and password."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 2. Clean the ID: Strip out letters/prefixes to extract the raw 12 digits
        numeric_id_str = re.sub(r'\D', '', str(provided_id))
        
        if not numeric_id_str or len(numeric_id_str) != 12:
            return Response(
                {"error": "Invalid ID format. Must contain exactly a 12-digit number."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        numeric_id = int(numeric_id_str)
        role = role.lower()

        # 3. Look up the Model based on the role dictionary
        ModelClass = self.ROLE_MODEL_MAP.get(role)
        
        if not ModelClass:
            return Response({"error": "Invalid registration role."}, status=status.HTTP_400_BAD_REQUEST)

        # 4. Check if a user with this ID already exists in this target table
        if ModelClass.objects.filter(id=numeric_id).exists():
            return Response(
                {"error": f"A user with this ID already exists in the {ModelClass.__name__} registry."},
                status=status.HTTP_409_CONFLICT
            )

        # 5. Securely hash the password before saving (Never store raw text strings!)
        hashed_password = make_password(password)

        # 6. Build the dynamic object data parameters
        user_data = {
            "id": numeric_id,
            "password": hashed_password
        }
        
        # Only assign name if your target model explicitly supports it
        if hasattr(ModelClass, 'name'):
            user_data['name'] = name
            
        # Merge extra field payloads (like department codes or metadata) if applicable
        user_data.update(extra_data)

        # 7. Write directly to the dynamic database table
        try:
            new_user = ModelClass.objects.create(**user_data)
            role_name = ModelClass.__name__.lower()
            
            return Response({
                "message": f"{ModelClass.__name__} account registered successfully.",
                "role": role_name,
                "user_id": new_user.id,
                "table_written_to": ModelClass._meta.db_table
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {"error": f"Failed to save user data to database: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )