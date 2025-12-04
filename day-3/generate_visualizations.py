"""
Visualization Generator for Synthetic Tournament
Creates all visualizations for FR-007
"""

import json

# Load the synthetic tournament data
with open('synthetic_tournament_data.json', 'r') as f:
    data = json.load(f)

recipes = data['recipes']
matches = data['matches']
champion = data['champion']

print("=" * 80)
print("SYNTHETIC HOT COCOA CHAMPIONSHIP 2025 - VISUALIZATIONS")
print("=" * 80)
print()

# 1. Tournament Bracket - Sankey Diagram Data
print("1️⃣  TOURNAMENT BRACKET (Sankey Diagram)")
print("-" * 80)

sankey_data = {
    "nodes": [],
    "links": []
}

# Add all unique competitors at each stage
round_winners = {}
for match in matches:
    round_name = match['round']
    if round_name not in round_winners:
        round_winners[round_name] = []
    round_winners[round_name].append({
        'winner': match['winner'],
        'loser': match['loser'],
        'winner_votes': match['winner_votes'],
        'loser_votes': match['loser_votes']
    })

# Build simplified Sankey
nodes_set = set()
links = []

# Round of 16 winners to Quarterfinals
for match in matches[:8]:
    winner = match['winner']
    nodes_set.add(winner)
    links.append({
        "source": winner,
        "target": "Quarterfinals",
        "value": match['winner_votes']
    })

nodes_set.add("Quarterfinals")

# Quarterfinals winners to Semifinals
qf_winners = []
for match in matches[8:12]:
    winner = match['winner']
    qf_winners.append(winner)
    links.append({
        "source": "Quarterfinals",
        "target": winner + " (SF)",
        "value": match['winner_votes']
    })
    nodes_set.add(winner + " (SF)")

# Semifinals winners to Finals
for match in matches[12:14]:
    winner = match['winner']
    links.append({
        "source": winner + " (SF)",
        "target": "Finals",
        "value": match['winner_votes']
    })

nodes_set.add("Finals")

# Finals winner to Champion
final_match = matches[-1]
links.append({
    "source": "Finals",
    "target": f"🏆 {champion}",
    "value": final_match['winner_votes']
})
nodes_set.add(f"🏆 {champion}")

sankey_data['nodes'] = [{"name": node} for node in nodes_set]
sankey_data['links'] = links

print("Sankey Data Structure:")
print(f"  - Nodes: {len(sankey_data['nodes'])}")
print(f"  - Links: {len(sankey_data['links'])}")
print(f"  - Champion: {champion}")
print()

# 2. Vote Distribution - Championship Final
print("2️⃣  CHAMPIONSHIP FINAL VOTES (Bar Chart)")
print("-" * 80)

final_match = matches[-1]
bar_data = {
    "type": "bar",
    "title": "Championship Final - Vote Distribution",
    "subtitle": f"{final_match['recipe1']} vs {final_match['recipe2']}",
    "labels": [final_match['recipe1'], final_match['recipe2']],
    "datasets": [{
        "label": "Votes Received",
        "data": [final_match['recipe1_votes'], final_match['recipe2_votes']]
    }]
}

print(f"  Winner: {final_match['winner']} ({final_match['winner_votes']} votes)")
print(f"  Runner-up: {final_match['loser']} ({final_match['loser_votes']} votes)")
print(f"  Margin: {final_match['margin']} votes")
print()

# 3. All Round Votes - Donut Charts
print("3️⃣  VOTES BY ROUND (Donut Charts)")
print("-" * 80)

round_totals = {}
for match in matches:
    round_name = match['round']
    if round_name not in round_totals:
        round_totals[round_name] = {'winner_votes': 0, 'loser_votes': 0, 'matches': 0}
    round_totals[round_name]['winner_votes'] += match['winner_votes']
    round_totals[round_name]['loser_votes'] += match['loser_votes']
    round_totals[round_name]['matches'] += 1

for round_name, totals in round_totals.items():
    print(f"  {round_name}:")
    print(f"    - Matches: {totals['matches']}")
    print(f"    - Winner votes: {totals['winner_votes']}")
    print(f"    - Loser votes: {totals['loser_votes']}")
    print(f"    - Total votes: {totals['winner_votes'] + totals['loser_votes']}")
print()

# 4. Recipe Attributes - Top 4 Finalists
print("4️⃣  TOP 4 FINALISTS - ATTRIBUTE COMPARISON (Radar Chart)")
print("-" * 80)

# Get semifinalists
semifinal_matches = [m for m in matches if m['round'] == 'Semifinals']
finalists = set()
for match in semifinal_matches:
    finalists.add(match['recipe1'])
    finalists.add(match['recipe2'])

finalist_recipes = [r for r in recipes if r['name'] in finalists]

print("Finalists:")
for recipe in finalist_recipes:
    attrs = recipe['attributes']
    avg_score = sum(attrs.values()) / len(attrs)
    print(f"  {recipe['name']}")
    print(f"    Average Score: {avg_score:.2f}")
    print(f"    Taste: {attrs['taste']:.1f} | Presentation: {attrs['presentation']:.1f}")
    print(f"    Creativity: {attrs['creativity']:.1f} | Aroma: {attrs['aroma']:.1f}")
    print(f"    Texture: {attrs['texture']:.1f}")
print()

radar_data = {
    "labels": ["Taste", "Presentation", "Creativity", "Aroma", "Texture"],
    "datasets": []
}

for recipe in finalist_recipes:
    attrs = recipe['attributes']
    radar_data['datasets'].append({
        "label": recipe['name'],
        "data": [
            round(attrs['taste'], 1),
            round(attrs['presentation'], 1),
            round(attrs['creativity'], 1),
            round(attrs['aroma'], 1),
            round(attrs['texture'], 1)
        ]
    })

# 5. Match Competitiveness - Treemap
print("5️⃣  MATCH COMPETITIVENESS BY ROUND (Statistics)")
print("-" * 80)

for round_name in ["Round of 16", "Quarterfinals", "Semifinals", "Finals"]:
    round_matches = [m for m in matches if m['round'] == round_name]
    margins = [m['margin'] for m in round_matches]
    avg_margin = sum(margins) / len(margins) if margins else 0
    min_margin = min(margins) if margins else 0
    max_margin = max(margins) if margins else 0
    
    print(f"  {round_name}:")
    print(f"    Avg margin: {avg_margin:.1f} votes")
    print(f"    Closest match: {min_margin} votes")
    print(f"    Biggest blowout: {max_margin} votes")
print()

# 6. Champion's Journey
print("6️⃣  CHAMPION'S JOURNEY")
print("-" * 80)

champion_matches = [m for m in matches if m['winner'] == champion or m['recipe1'] == champion or m['recipe2'] == champion]
champion_recipe = next(r for r in recipes if r['name'] == champion)

print(f"🏆 {champion}")
print()
print("Match History:")
for i, match in enumerate(champion_matches, 1):
    opponent = match['recipe2'] if match['recipe1'] == champion else match['recipe1']
    champ_votes = match['recipe1_votes'] if match['recipe1'] == champion else match['recipe2_votes']
    opp_votes = match['recipe2_votes'] if match['recipe1'] == champion else match['recipe1_votes']
    print(f"  {i}. {match['round']}: vs {opponent}")
    print(f"     Result: {champ_votes}-{opp_votes} (margin: {abs(champ_votes - opp_votes)})")
print()
print("Attributes:")
for attr, value in champion_recipe['attributes'].items():
    print(f"  {attr.capitalize()}: {value:.1f}/10")
print()

# Save visualization data for use in Goose
viz_data = {
    "sankey": sankey_data,
    "bar_chart": bar_data,
    "radar_chart": radar_data,
    "round_totals": round_totals,
    "finalist_recipes": finalist_recipes,
    "champion_journey": champion_matches
}

with open('visualization_data.json', 'w') as f:
    json.dump(viz_data, f, indent=2)

print("=" * 80)
print("✅ Visualization data generated and saved to visualization_data.json")
print("=" * 80)
