from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, DepartmentViewSet, AssetViewSet, AllocationRequestViewSet ,ResourceBookingViewSet, AuditCycleViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'departments', DepartmentViewSet)
router.register(r'assets', AssetViewSet)
router.register(r'allocations', AllocationRequestViewSet)
router.register(r'bookings', ResourceBookingViewSet)
router.register(r'audits', AuditCycleViewSet)

urlpatterns = [
    path('', include(router.urls)),
]