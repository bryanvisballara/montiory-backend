Variables recomendadas para Render

Backend API

PORT=10000
NODE_ENV=production
MONGODB_URI=<uri_del_cluster_del_proyecto_montiory>
MONGODB_DB=montiory
JWT_SECRET=<un_secreto_largo_y_privado>
ADMIN_EMAIL=admin@montiory.com
ADMIN_ORDER_EMAIL=admin@montiory.com
ADMIN_PASSWORD=112233
OPERATOR_EMAIL=andrisfontalvo9@gmail.com
OPERATOR_PASSWORD=010203
PARTNER_NAME=Embajador Demo
PARTNER_EMAIL=embajador.demo@montiory.com
PARTNER_PASSWORD=Embajador12345
CLIENT_URL=https://montiory.com,https://www.montiory.com,https://montiory-backend.onrender.com,http://localhost:5174,http://127.0.0.1:5174
STOREFRONT_URL=https://montiory.com
WHATSAPP_PHONE_NUMBER=573001767364
BREVO_API_KEY=<tu_brevo_api_key>
BREVO_SENDER_EMAIL=orders@montiory.com
BREVO_SENDER_NAME=Montiory
CLOUDINARY_CLOUD_NAME=duh2g4lo0
CLOUDINARY_API_KEY=<tu_cloudinary_api_key>
CLOUDINARY_API_SECRET=<tu_cloudinary_api_secret>
CLOUDINARY_UPLOAD_FOLDER=montiory/products
WOMPI_PUBLIC_KEY=pub_prod_xxxxxxxxxxxxxxxxxxxxx
WOMPI_INTEGRITY_SECRET=<tu_event_integrity_secret>
WOMPI_EVENTS_SECRET=<tu_events_secret>

Frontend Admin

VITE_APP_NAME=Montiory Admin
VITE_API_URL=https://montiory-backend.onrender.com/api

Frontend Storefront

VITE_APP_NAME=Montiory Storefront
VITE_API_URL=https://montiory-backend.onrender.com/api

Notas

- La `MONGODB_URI` debe salir del cluster creado dentro del proyecto MongoDB Atlas de Montiory, no del proyecto Salva Fragance. La base puede llamarse `montiory`.
- `ADMIN_EMAIL` y `ADMIN_PASSWORD` corresponden al seed inicial del login administrativo.
- `OPERATOR_EMAIL` y `OPERATOR_PASSWORD` crean o actualizan el usuario operario con acceso a ordenes, preordenes, marketing y cupones.
- `PARTNER_NAME`, `PARTNER_EMAIL` y `PARTNER_PASSWORD` crean o actualizan un embajador de prueba para entrar por el mismo login page del portal.
- `ADMIN_ORDER_EMAIL` es opcional; si existe, recibira las notificaciones de nuevas ordenes del checkout. Si no existe, se usa `ADMIN_EMAIL`.
- `JWT_SECRET` debe cambiarse por un valor largo y privado antes de produccion real.
- Brevo enviara el correo de pedido recibido y el correo con numero de seguimiento.
- Cloudinary requiere `CLOUDINARY_CLOUD_NAME`; debe ser el cloud name tecnico exacto de tu consola. En este proyecto el valor valido es `duh2g4lo0`.
- `STOREFRONT_URL` debe apuntar al dominio publico de la tienda. Se usa para construir el `redirectUrl` del pago online.
- `WHATSAPP_PHONE_NUMBER` define el WhatsApp final al que redirige la compra aprobada.
- `WOMPI_PUBLIC_KEY` es la llave publica del comercio para abrir el widget.
- `WOMPI_INTEGRITY_SECRET` se usa para firmar la sesion del widget desde backend.
- `WOMPI_EVENTS_SECRET` se usa para validar la firma de los eventos `transaction.updated`.
- Render service ID: `srv-d8b1jja8qa3s73dfut90`
- Backend publico: `https://montiory-backend.onrender.com`
- Repositorio backend: `https://github.com/bryanvisballara/montiory-backend.git`
- URL de eventos de Wompi: `https://montiory-backend.onrender.com/api/storefront/checkout/online/wompi/events`