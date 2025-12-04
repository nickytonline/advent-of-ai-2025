"""
Synthetic Tournament Generator for Hot Cocoa Championship
FR-007: Advanced Challenge - Generate realistic tournament data

This script creates:
- 16 unique hot cocoa recipes with creative names
- Realistic voting patterns and distributions
- Complete tournament bracket progression
- Multiple attribute scores for each recipe
"""

import random
import json
from datetime import datetime
from typing import List, Dict, Tuple

# Seed for reproducibility
random.seed(42)


class RecipeGenerator:
    """Generate creative hot cocoa recipe names and attributes"""
    
    ADJECTIVES = [
        "Velvet", "Silky", "Divine", "Arctic", "Midnight", "Golden",
        "Whispered", "Enchanted", "Dreamy", "Frosted", "Spiced", "Caramel",
        "Ruby", "Mystic", "Cloud", "Winter"
    ]
    
    FLAVORS = [
        "Cinnamon", "Peppermint", "Hazelnut", "Vanilla", "Mocha",
        "Raspberry", "Orange", "Lavender", "Maple", "Coconut",
        "Salted Caramel", "Chili", "Cardamom", "Rose", "Espresso", "Almond"
    ]
    
    BASES = [
        "Delight", "Dream", "Bliss", "Wonder", "Magic",
        "Kiss", "Swirl", "Symphony", "Embrace", "Cascade"
    ]
    
    @staticmethod
    def generate_recipe_name() -> str:
        """Generate a unique, creative recipe name"""
        return f"{random.choice(RecipeGenerator.ADJECTIVES)} {random.choice(RecipeGenerator.FLAVORS)} {random.choice(RecipeGenerator.BASES)}"
    
    @staticmethod
    def generate_attributes() -> Dict[str, float]:
        """Generate realistic attribute scores (0-10 scale)"""
        # Create correlated scores (good recipes tend to be good overall)
        base_quality = random.uniform(6.0, 9.5)
        variation = 1.5
        
        return {
            "taste": max(0, min(10, base_quality + random.uniform(-variation, variation))),
            "presentation": max(0, min(10, base_quality + random.uniform(-variation, variation))),
            "creativity": max(0, min(10, base_quality + random.uniform(-variation, variation))),
            "aroma": max(0, min(10, base_quality + random.uniform(-variation, variation))),
            "texture": max(0, min(10, base_quality + random.uniform(-variation, variation)))
        }


class VotingSimulator:
    """Simulate realistic voting patterns"""
    
    @staticmethod
    def calculate_win_probability(recipe1_attrs: Dict, recipe2_attrs: Dict) -> float:
        """Calculate probability of recipe1 winning based on attributes"""
        score1 = sum(recipe1_attrs.values())
        score2 = sum(recipe2_attrs.values())
        
        # Use logistic function for realistic probability
        diff = score1 - score2
        probability = 1 / (1 + 2.7182818 ** (-diff))
        return probability
    
    @staticmethod
    def generate_votes(recipe1_attrs: Dict, recipe2_attrs: Dict, 
                       total_votes: int = 100) -> Tuple[int, int]:
        """Generate vote counts based on recipe quality"""
        win_prob = VotingSimulator.calculate_win_probability(recipe1_attrs, recipe2_attrs)
        
        # Add some randomness to make it realistic
        votes1 = int(random.gauss(win_prob * total_votes, 5))
        votes1 = max(0, min(total_votes, votes1))
        votes2 = total_votes - votes1
        
        return votes1, votes2
    
    @staticmethod
    def create_upset(weak_votes: int, strong_votes: int, upset_margin: int = 10) -> Tuple[int, int]:
        """Create an upset scenario"""
        total = weak_votes + strong_votes
        new_weak_votes = (total // 2) + random.randint(1, upset_margin)
        new_strong_votes = total - new_weak_votes
        return new_weak_votes, new_strong_votes


class TournamentGenerator:
    """Generate complete tournament bracket"""
    
    def __init__(self):
        self.recipes = []
        self.matches = []
        self.round_names = ["Round of 16", "Quarterfinals", "Semifinals", "Finals"]
        
    def generate_recipes(self, count: int = 16) -> List[Dict]:
        """Generate unique recipes"""
        recipes = []
        used_names = set()
        
        while len(recipes) < count:
            name = RecipeGenerator.generate_recipe_name()
            if name not in used_names:
                used_names.add(name)
                recipes.append({
                    "id": len(recipes) + 1,
                    "name": name,
                    "attributes": RecipeGenerator.generate_attributes()
                })
        
        self.recipes = recipes
        return recipes
    
    def simulate_match(self, recipe1: Dict, recipe2: Dict, round_name: str, 
                       match_num: int, allow_upset: bool = False) -> Dict:
        """Simulate a single match"""
        votes1, votes2 = VotingSimulator.generate_votes(
            recipe1["attributes"], 
            recipe2["attributes"],
            total_votes=random.randint(95, 105)  # Vary total votes slightly
        )
        
        # Occasionally create upsets in early rounds
        if allow_upset and random.random() < 0.15 and votes1 > votes2:
            votes1, votes2 = VotingSimulator.create_upset(votes2, votes1)
        
        winner = recipe1 if votes1 > votes2 else recipe2
        loser = recipe2 if votes1 > votes2 else recipe1
        winner_votes = max(votes1, votes2)
        loser_votes = min(votes1, votes2)
        
        match = {
            "round": round_name,
            "match_number": match_num,
            "recipe1": recipe1["name"],
            "recipe2": recipe2["name"],
            "recipe1_votes": votes1,
            "recipe2_votes": votes2,
            "winner": winner["name"],
            "loser": loser["name"],
            "winner_votes": winner_votes,
            "loser_votes": loser_votes,
            "margin": abs(votes1 - votes2),
            "total_votes": votes1 + votes2
        }
        
        return match, winner
    
    def run_tournament(self) -> List[Dict]:
        """Run complete tournament simulation"""
        if not self.recipes:
            self.generate_recipes()
        
        # Shuffle recipes for initial bracket
        current_round = random.sample(self.recipes, len(self.recipes))
        
        for round_idx, round_name in enumerate(self.round_names):
            next_round = []
            matches_in_round = len(current_round) // 2
            
            for match_num in range(matches_in_round):
                recipe1 = current_round[match_num * 2]
                recipe2 = current_round[match_num * 2 + 1]
                
                # Allow upsets in first two rounds
                allow_upset = round_idx < 2
                
                match, winner = self.simulate_match(
                    recipe1, recipe2, round_name, match_num + 1, allow_upset
                )
                
                self.matches.append(match)
                next_round.append(winner)
            
            current_round = next_round
        
        return self.matches
    
    def get_champion(self) -> str:
        """Get tournament champion"""
        if self.matches:
            return self.matches[-1]["winner"]
        return None
    
    def export_data(self) -> Dict:
        """Export all tournament data"""
        return {
            "tournament_name": "Synthetic Hot Cocoa Championship 2025",
            "generated_at": datetime.now().isoformat(),
            "total_recipes": len(self.recipes),
            "total_matches": len(self.matches),
            "champion": self.get_champion(),
            "recipes": self.recipes,
            "matches": self.matches
        }
    
    def export_markdown(self) -> str:
        """Export tournament data in markdown format"""
        md = "# Synthetic Hot Cocoa Championship 2025\n\n"
        md += f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
        md += f"**Champion:** {self.get_champion()}\n\n"
        
        md += "## Recipes\n\n"
        for recipe in self.recipes:
            md += f"### {recipe['name']}\n"
            md += f"- **Taste:** {recipe['attributes']['taste']:.1f}\n"
            md += f"- **Presentation:** {recipe['attributes']['presentation']:.1f}\n"
            md += f"- **Creativity:** {recipe['attributes']['creativity']:.1f}\n"
            md += f"- **Aroma:** {recipe['attributes']['aroma']:.1f}\n"
            md += f"- **Texture:** {recipe['attributes']['texture']:.1f}\n\n"
        
        md += "## Tournament Matches\n\n"
        current_round = ""
        for match in self.matches:
            if match["round"] != current_round:
                current_round = match["round"]
                md += f"### {current_round}\n\n"
            
            md += f"**Match {match['match_number']}:** {match['recipe1']} vs {match['recipe2']}\n"
            md += f"- Votes: {match['recipe1_votes']} - {match['recipe2_votes']}\n"
            md += f"- **Winner:** {match['winner']} (margin: {match['margin']})\n\n"
        
        return md


def main():
    """Generate synthetic tournament and export data"""
    print("🏆 Synthetic Hot Cocoa Championship Generator")
    print("=" * 60)
    
    # Generate tournament
    tournament = TournamentGenerator()
    print("\n📝 Generating 16 unique recipes...")
    recipes = tournament.generate_recipes(16)
    print(f"✓ Generated {len(recipes)} recipes")
    
    print("\n🎯 Running tournament simulation...")
    matches = tournament.run_tournament()
    print(f"✓ Completed {len(matches)} matches")
    
    print(f"\n🥇 Champion: {tournament.get_champion()}")
    
    # Export data
    print("\n💾 Exporting data...")
    
    # JSON export
    json_data = tournament.export_data()
    with open("synthetic_tournament_data.json", "w") as f:
        json.dump(json_data, f, indent=2)
    print("✓ Exported to synthetic_tournament_data.json")
    
    # Markdown export
    md_data = tournament.export_markdown()
    with open("synthetic_tournament_data.md", "w") as f:
        f.write(md_data)
    print("✓ Exported to synthetic_tournament_data.md")
    
    print("\n" + "=" * 60)
    print("✨ Generation complete! Ready for visualization.")


if __name__ == "__main__":
    main()
