from app.simulation.components.network import (
    LoadBalancer,
    APIGateway,
)

from app.simulation.components.compute import (
    VirtualMachine,
    Container,
    ServerlessFunction,
)

from app.simulation.components.database import (
    PostgreSQL,
    MySQL,
    CacheLayer,
)

COMPONENT_REGISTRY = {
    "LoadBalancer": LoadBalancer(),
    "APIGateway": APIGateway(),
    "VirtualMachine": VirtualMachine(),
    "Container": Container(),
    "ServerlessFunction": ServerlessFunction(),
    "PostgreSQL": PostgreSQL(),
    "MySQL": MySQL(),
    "CacheLayer": CacheLayer(),
}