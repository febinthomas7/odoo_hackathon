from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.hashers import check_password  # <-- Import this!
import re

from assets.models import Admin, Department, Employee, AssetManager

class RoleBasedLoginView(APIView):
    permission_classes = [] 
    authentication_classes = []

    ROLE_MODEL_MAP = {
        "admin": Admin, "ad": Admin,
        "department": Department, "dp": Department,
        "employee": Employee, "ep": Employee,
        "assetManager": AssetManager, "am": AssetManager
    }

    def post(self, request, role):
        # 1. Get the ID and password from the request
        provided_id = request.data.get("id") or request.data.get("username")
        password = request.data.get("password")

        if not provided_id or not password:
            return Response(
                {"error": "Please provide both id and password."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 2. Clean the ID: Strip out "Ad-", "Dr-", etc.
        numeric_id_str = re.sub(r'\D', '', str(provided_id))
        
        if not numeric_id_str:
            return Response(
                {"error": "Invalid ID format. Must contain the 12-digit number."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        numeric_id = int(numeric_id_str)
        role = role.lower()

        # 3. Look up the Model based on the role dictionary
        ModelClass = self.ROLE_MODEL_MAP.get(role)
        
        if not ModelClass:
            return Response({"error": "Invalid login role."}, status=status.HTTP_400_BAD_REQUEST)
        
        role_name = ModelClass.__name__.lower()

        # 4. Query the exact custom table using the designated Model
        try:
            user_instance = ModelClass.objects.get(id=numeric_id)
        except ModelClass.DoesNotExist:
            return Response({"error": "User with this ID not found."}, status=status.HTTP_404_NOT_FOUND)

        # 5. Verify the password safely using cryptographic verification
        if not check_password(password, user_instance.password):
            return Response(
                {"error": "Invalid password."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # 6. Generate Custom JWT Token
        refresh = RefreshToken()
        refresh['user_id'] = user_instance.id
        refresh['role'] = role_name

        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "role": role_name,
            "user_id": getattr(user_instance, 'custom_id', user_instance.id),
            "name": getattr(user_instance, 'name', 'Unknown')
        }, status=status.HTTP_200_OK)