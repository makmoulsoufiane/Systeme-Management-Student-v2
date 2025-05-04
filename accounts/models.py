from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.urls import reverse
from django.utils.translation import gettext as _
from django_countries.fields import CountryField
from django.utils.text import slugify
from django.db.models.signals import post_save

# Create your models here.

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    slug = models.SlugField(max_length=100, unique=True, blank=True, null=True, verbose_name=_("Slug"))
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True, verbose_name=_("Profile Picture"))
    country = CountryField(blank=True, null=True, verbose_name=_("Country"))
    address = models.CharField(max_length=255, verbose_name=_("Address"), blank=True, null=True)
    join_date = models.DateTimeField(default=timezone.now, verbose_name=_("Join Date"))



    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.user.username)
        super(Profile, self).save(*args, **kwargs)


    class Meta:
        verbose_name = _("Profile")
        verbose_name_plural = _("Profiles")

    def __str__(self):
        return '%s' % (self.user.username)

    def get_absolute_url(self):
        return reverse("accounts:Profile_detail", kwargs={"slug": self.slug})


def create_profile(sender, **kwargs):
    if kwargs['created']:
        user_profile = Profile.objects.create(user=kwargs['instance'])



post_save.connect(create_profile, sender=User)
 