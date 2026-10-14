"""
Strategy Registry — maps strategy name strings to their classes.

To add a new algorithm:
  1. Implement AlgorithmStrategy in a new file under app/strategies/
  2. Import it here and add one entry to STRATEGY_REGISTRY
  3. Done — no other files need to change.
"""
from app.strategies.base import AlgorithmStrategy
from app.strategies.graph_clustering import GraphClusteringStrategy
from app.strategies.preference_queue_louvain import PreferenceQueueLouvainStrategy
from typing import Dict, Type

STRATEGY_REGISTRY: Dict[str, Type[AlgorithmStrategy]] = {
    "graph_clustering": GraphClusteringStrategy,
    "preference_queue_louvain": PreferenceQueueLouvainStrategy,
    # "rule_based":       RuleBasedStrategy,       # future
    # "stable_matching":  StableMatchingStrategy,  # future
}

DEFAULT_STRATEGY = "preference_queue_louvain"


def get_strategy(name: str) -> AlgorithmStrategy:
    """
    Instantiate and return a strategy by name.
    Raises ValueError if name is not registered.
    """
    cls = STRATEGY_REGISTRY.get(name)
    if cls is None:
        available = ", ".join(STRATEGY_REGISTRY.keys())
        raise ValueError(
            f"Unknown strategy '{name}'. Available strategies: {available}"
        )
    return cls()


def list_strategies() -> list:
    """Return a list of {name, description} dicts for the API."""
    return [
        {"name": name, "description": cls().description}
        for name, cls in STRATEGY_REGISTRY.items()
    ]
