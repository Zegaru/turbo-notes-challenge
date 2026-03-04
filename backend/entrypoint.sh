#!/bin/bash
set -e
mkdir -p "${MEDIA_ROOT:-/data/media}"
python manage.py collectstatic --noinput
python manage.py migrate --noinput
exec "$@"
