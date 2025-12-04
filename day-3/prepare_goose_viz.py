"""
Create all visualizations for synthetic tournament using Goose
"""

import json

# Load data
with open('visualization_data.json', 'r') as f:
    viz_data = json.load(f)

# Print the data structures for Goose to use
print("=" * 80)
print("SYNTHETIC TOURNAMENT VISUALIZATIONS - DATA FOR GOOSE")
print("=" * 80)
print()

# 1. Bar Chart Data
print("1. CHAMPIONSHIP FINAL BAR CHART:")
print(json.dumps(viz_data['bar_chart'], indent=2))
print()

# 2. Radar Chart Data
print("2. TOP 4 FINALISTS RADAR CHART:")
print(json.dumps(viz_data['radar_chart'], indent=2))
print()

# 3. Donut Chart for Round Distribution
print("3. VOTE DISTRIBUTION BY ROUND (Donut Chart):")
donut_data = []
for round_name, stats in viz_data['round_totals'].items():
    donut_data.append({
        "title": f"{round_name} - Vote Distribution",
        "type": "doughnut",
        "data": [
            {"label": "Winner Votes", "value": stats['winner_votes']},
            {"label": "Runner-up Votes", "value": stats['loser_votes']}
        ]
    })
print(json.dumps(donut_data, indent=2))
print()

# 4. Champion's Journey Line Chart
print("4. CHAMPION'S JOURNEY (Line Chart):")
champion_journey = viz_data['champion_journey']
rounds = [m['round'] for m in champion_journey]
margins = [m['margin'] for m in champion_journey]
champion_votes = [m['winner_votes'] if m['winner'] == 'Silky Lavender Magic' else m['loser_votes'] for m in champion_journey]

journey_chart = {
    "type": "line",
    "title": "Champion's Journey - Silky Lavender Magic",
    "subtitle": "Vote performance across tournament rounds",
    "labels": rounds,
    "datasets": [
        {
            "label": "Votes Received",
            "data": champion_votes
        },
        {
            "label": "Victory Margin",
            "data": margins
        }
    ]
}
print(json.dumps(journey_chart, indent=2))
print()

# 5. All Recipes Attribute Comparison (Scatter)
print("5. ALL RECIPES QUALITY SCATTER:")
with open('synthetic_tournament_data.json', 'r') as f:
    full_data = json.load(f)

recipes = full_data['recipes']
avg_scores = []
taste_scores = []
recipe_names = []

for recipe in recipes:
    attrs = recipe['attributes']
    avg = sum(attrs.values()) / len(attrs)
    avg_scores.append(round(avg, 2))
    taste_scores.append(round(attrs['taste'], 2))
    recipe_names.append(recipe['name'][:20])  # Truncate for readability

scatter_chart = {
    "type": "scatter",
    "title": "Recipe Quality Analysis",
    "subtitle": "Average Score vs Taste Score for all 16 recipes",
    "xAxisLabel": "Average Score",
    "yAxisLabel": "Taste Score",
    "datasets": [{
        "label": "Recipes",
        "data": [{"x": avg_scores[i], "y": taste_scores[i]} for i in range(len(recipes))]
    }]
}
print(json.dumps(scatter_chart, indent=2))
print()

# 6. Match Competitiveness by Round
print("6. MATCH COMPETITIVENESS BY ROUND (Bar Chart):")
competitiveness_data = {
    "type": "bar",
    "title": "Average Victory Margin by Tournament Round",
    "subtitle": "Lower margin = more competitive matches",
    "labels": list(viz_data['round_totals'].keys()),
    "datasets": [{
        "label": "Average Margin (votes)",
        "data": []
    }]
}

# Calculate average margins
for round_name in viz_data['round_totals'].keys():
    matches = [m for m in full_data['matches'] if m['round'] == round_name]
    avg_margin = sum(m['margin'] for m in matches) / len(matches) if matches else 0
    competitiveness_data['datasets'][0]['data'].append(round(avg_margin, 1))

print(json.dumps(competitiveness_data, indent=2))
print()

print("=" * 80)
print("Copy the JSON structures above to use with Goose visualization tools")
print("=" * 80)
