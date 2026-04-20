from django.test import TestCase
from django.contrib.auth.models import User
from .models import MenuConfig

class MenuConfigTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='1234')
        self.config = MenuConfig.objects.create(
            usuario=self.user,
            modulos_visibles=['venta', 'compras'],
            menu_personalizado={'dashboard': True}
        )

    def test_menu_config_creation(self):
        self.assertEqual(self.config.usuario.username, 'testuser')
        self.assertIn('venta', self.config.modulos_visibles)
