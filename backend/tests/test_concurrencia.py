"""Peticiones simultáneas al catálogo: con SQLite en fichero cada petición usa su propia conexión."""
from collections import Counter
from concurrent.futures import ThreadPoolExecutor

URLS = ["/api/catalog/module/0237", "/api/catalog/curriculum/ELE203", "/api/families?region_id=1", "/api/modules"]


def test_peticiones_simultaneas_no_dan_500(client):
    with ThreadPoolExecutor(16) as ex:
        codigos = list(ex.map(lambda i: client.get(URLS[i % len(URLS)]).status_code, range(64)))
    assert Counter(codigos).get(500, 0) == 0, Counter(codigos)
