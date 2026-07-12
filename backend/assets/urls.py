from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.ser import UserViewSet, DepartmentViewSet, AssetViewSet, AllocationRequestViewSet ,ResourceBookingViewSet, AuditCycleViewSet
from .views.login import RoleBasedLoginView
from .views.signup import RoleBasedSignupView

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'departments', DepartmentViewSet)
router.register(r'assets', AssetViewSet)
router.register(r'allocations', AllocationRequestViewSet)
router.register(r'bookings', ResourceBookingViewSet)
router.register(r'audits', AuditCycleViewSet)

urlpatterns = [
    path('', include(router.urls)),

    path('<str:role>/login/', RoleBasedLoginView.as_view(), name='role-based-login'),
    path('<str:role>/signup/', RoleBasedSignupView.as_view(), name='role-signup'),
]