from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Department, Asset, AllocationRequest

# Serializer for Employee Directory
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password']
        extra_kwargs = {
            # write_only guarantees the password won't leak out in GET JSON responses
            'password': {'write_only': True, 'required': True}
        }

    def create(self, validated_data):
        """
        Intercepts the incoming creation payload and utilizes Django's built-in
        cryptographic hashing functions to store the password securely.
        """
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            password=validated_data['password'] # This securely encrypts the raw string
        )
        return user

# Serializer for Departments
class DepartmentSerializer(serializers.ModelSerializer):
    head_details = UserSerializer(source='head', read_only=True)

    class Meta:
        model = Department
        fields = ['id', 'name', 'head', 'head_details', 'is_active']

# Serializer for Assets
class AssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = ['id', 'name', 'category', 'asset_tag', 'status', 'location']

# Serializer for Allocation Workflows
class AllocationRequestSerializer(serializers.ModelSerializer):
    asset_details = AssetSerializer(source='asset', read_only=True)
    employee_details = UserSerializer(source='employee', read_only=True)

    class Meta:
        model = AllocationRequest
        fields = ['id', 'asset', 'asset_details', 'employee', 'employee_details', 'allocated_at', 'expected_return_date', 'is_active']

    def validate(self, data):
        """
        Runs the model's clean validation constraints to catch 
        double-allocation errors during API payload processing.
        """
        instance = AllocationRequest(**data)
        try:
            instance.clean()
        except Exception as e:
            raise serializers.ValidationError(e.messages)
        return data

from .models import ResourceBooking, AuditCycle

class ResourceBookingSerializer(serializers.ModelSerializer):
    employee_details = UserSerializer(source='employee', read_only=True)

    class Meta:
        model = ResourceBooking
        fields = ['id', 'resource_name', 'employee', 'employee_details', 'start_time', 'end_time', 'status']

    def validate(self, data):
        instance = ResourceBooking(**data)
        try:
            instance.clean()
        except Exception as e:
            raise serializers.ValidationError(e.messages)
        return data

class AuditCycleSerializer(serializers.ModelSerializer):
    auditor_details = UserSerializer(source='auditor', read_only=True)

    class Meta:
        model = AuditCycle
        fields = ['id', 'name', 'scope_location', 'start_date', 'end_date', 'auditor', 'auditor_details', 'is_closed', 'discrepancy_report']    