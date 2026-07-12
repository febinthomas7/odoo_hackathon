from rest_framework import viewsets
from django.contrib.auth.models import User
from assets.models import Department, Asset, AllocationRequest ,ResourceBooking, AuditCycle
from assets.serializers import UserSerializer, DepartmentSerializer, AssetSerializer, AllocationRequestSerializer ,ResourceBookingSerializer, AuditCycleSerializer
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer

class AssetViewSet(viewsets.ModelViewSet):
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer

class AllocationRequestViewSet(viewsets.ModelViewSet):
    queryset = AllocationRequest.objects.all()
    serializer_class = AllocationRequestSerializer

class ResourceBookingViewSet(viewsets.ModelViewSet):
    queryset = ResourceBooking.objects.all()
    serializer_class = ResourceBookingSerializer

class AuditCycleViewSet(viewsets.ModelViewSet):
    queryset = AuditCycle.objects.all()
    serializer_class = AuditCycleSerializer    