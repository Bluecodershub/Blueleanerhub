# Configuration

The `config` directory provides a central place for loading environment
variables and shared settings across services.

- `settings.py` – lightweight loader that reads `.env` at the project root and
  exposes a `settings` object. Services may import and use attributes as needed.

Example:

```python
from config.settings import settings

db = Database.connect(settings.DATABASE_URL)
```

Developers can extend the class with additional helpers or convert it to a
JSON/YAML reader for more advanced deployments. Keeping configuration in one
place simplifies environment management and makes CI/CD secrets easier to map.
