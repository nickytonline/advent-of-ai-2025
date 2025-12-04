#!/usr/bin/env python3
"""Test script to understand visualization tool parameter format"""

import json

# Test data for Sankey diagram
sankey_data = {
    "nodes": [
        {"name": "Classic Swiss Velvet", "category": "quarterfinals"},
        {"name": "Peppermint Dream", "category": "quarterfinals"},
        {"name": "Dark Chocolate Decadence", "category": "quarterfinals"},
        {"name": "Cinnamon Fireside", "category": "quarterfinals"},
        {"name": "Semifinals", "category": "semifinals"},
        {"name": "Finals", "category": "finals"},
        {"name": "Champion", "category": "winner"}
    ],
    "links": [
        {"source": "Classic Swiss Velvet", "target": "Semifinals", "value": 234},
        {"source": "Peppermint Dream", "target": "Semifinals", "value": 312},
        {"source": "Dark Chocolate Decadence", "target": "Semifinals", "value": 276},
        {"source": "Cinnamon Fireside", "target": "Semifinals", "value": 267},
        {"source": "Semifinals", "target": "Finals", "value": 843},
        {"source": "Semifinals", "target": "Finals", "value": 899},
        {"source": "Finals", "target": "Champion", "value": 678}
    ]
}

print("Sankey Data:")
print(json.dumps(sankey_data, indent=2))
