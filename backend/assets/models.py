from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError

# 1. Department Management (Organization Setup Screen)
class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)
    head = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='managed_department')
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

# 2. Asset Registry (Asset Registration & Directory Screen)
class Asset(models.Model):
    STATUS_CHOICES = [
        ('AVAILABLE', 'Available'),
        ('ALLOCATED', 'Allocated'),
        ('RESERVED', 'Reserved'),
        ('MAINTENANCE', 'Under Maintenance'),
        ('LOST', 'Lost'),
        ('RETIRED', 'Retired'),
        ('DISPOSED', 'Disposed'),
    ]
    
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=100) # Electronics, Furniture, etc.
    asset_tag = models.CharField(max_length=50, unique=True) # e.g., AF-0001
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='AVAILABLE')
    location = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.asset_tag} - {self.name}"

# 3. Asset Allocation (Asset Allocation & Transfer Screen)
class AllocationRequest(models.Model):
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name='allocations')
    employee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='allocations')
    allocated_at = models.DateTimeField(auto_now_add=True)
    expected_return_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def clean(self):
        """
        Conflict Rule: Block allocation if the asset is already taken or under maintenance.
        """
        if self.is_active:
            if self.asset.status == 'ALLOCATED':
                raise ValidationError(
                    f"Conflict: The asset {self.asset.asset_tag} is currently held by someone else. Please initiate a Transfer Request instead."
                )
            elif self.asset.status == 'MAINTENANCE':
                raise ValidationError(
                    f"Conflict: The asset {self.asset.asset_tag} is currently under maintenance and cannot be allocated."
                )

    def save(self, *args, **kwargs):
        # Run the clean check before saving to the database
        self.full_clean()
        
        # If active allocation is approved, automatically flip the asset status
        if self.is_active:
            self.asset.status = 'ALLOCATED'
            self.asset.save()
            
        super().save(*args, **kwargs)


# 4. Shared Resource Booking (Resource Booking Screen)
class ResourceBooking(models.Model):
    STATUS_CHOICES = [
        ('UPCOMING', 'Upcoming'),
        ('ONGOING', 'Ongoing'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]

    resource_name = models.CharField(max_length=100) # e.g., "Room B2", "Vehicle AF-V1"
    employee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='UPCOMING')

    def clean(self):
        """
        Conflict Rule: Two people can't book the same resource at overlapping times.[cite: 1]
        """
        if self.start_time and self.end_time:
            if self.start_time >= self.end_time:
                raise ValidationError("End time must be after the start time.")

            # Overlap algorithm: (StartA < EndB) AND (EndA > StartB)
            overlapping_bookings = ResourceBooking.objects.filter(
                resource_name=self.resource_name,
                start_time__lt=self.end_time,
                end_time__gt=self.start_time
            ).exclude(pk=self.pk)

            if overlapping_bookings.exists():
                raise ValidationError(
                    f"Conflict: The resource '{self.resource_name}' is already booked during this time window."
                )

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.resource_name} ({self.start_time} - {self.end_time})"


# 5. Asset Audit Cycles (Asset Audit Screen)
class AuditCycle(models.Model):
    name = models.CharField(max_length=100) # e.g., "Q3 Electronics Audit"
    scope_location = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField()
    auditor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='assigned_audits')
    is_closed = models.BooleanField(default=False)
    discrepancy_report = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name        