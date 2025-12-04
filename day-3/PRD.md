# Product Requirements Document
## Hot Cocoa Championship Data Visualization System

**Document Version:** 1.0
**Date:** December 3, 2025
**Author:** AI Engineering Team
**Stakeholder:** Sarah Chen, Winter Festival Coordinator

---

Note: All charts should use the Auto-Visualiser extension tools (powered by MCP-UI with d3.js), not Mermaid diagrams. The Auto-Visualiser provides interactive visualization tools including Sankey diagrams, radar charts, chord diagrams, donut/pie charts, bar/line/scatter charts, treemaps, and maps.

## 1. Executive Summary

### 1.1 Problem Statement
The Winter Festival's Hot Cocoa Championship has concluded, but the data analyst is ill and the graphic designer is overwhelmed. The awards ceremony is in 18 hours, and presentation-ready visualizations are urgently needed to communicate tournament results to ceremony attendees.

### 1.2 Solution Overview
Leverage Goose Desktop's Auto-Visualiser extension (powered by MCP-UI) to rapidly generate interactive, presentation-quality data visualizations from the tournament data without requiring manual coding or design work.

### 1.3 Success Criteria
- Tournament results are clearly visualized and ready for ceremony presentation
- Multiple visualization types tell a complete story of the championship
- Charts are understandable to non-technical audience members
- Deliverables completed within 18-hour deadline

---

## 2. Stakeholders

| Role | Name | Responsibility |
|------|------|----------------|
| Primary Stakeholder | Sarah Chen | Festival Coordinator, final approval |
| End Users | Festival Attendees | Viewing visualizations at ceremony |
| Technical Owner | AI Engineering Team | Creating visualizations |
| Secondary Users | Festival Staff | Using charts for presentations |

---

## 3. User Stories

### 3.1 Primary User Stories

**US-001: As a** festival coordinator, **I want** to see the tournament bracket with winners, **so that** I can display the championship progression at the ceremony.

**US-002: As a** ceremony attendee, **I want** to understand vote distributions, **so that** I can see how close competitions were.

**US-003: As a** festival organizer, **I want** to compare recipe attributes, **so that** I can highlight what made winners successful.

**US-004: As a** presenter, **I want** visualizations that tell a complete story, **so that** the ceremony is engaging and informative.

### 3.2 Bonus User Stories

**US-005 (Beginner):** As a data analyst, I want to see 5+ different chart types, so that I can choose the most effective presentations.

**US-006 (Intermediate):** As a judge, I want to explore "what-if" scenarios, so that I can understand how close certain matches were.

**US-007 (Advanced):** As a festival planner, I want to generate simulated tournaments, so that I can plan future event structures.

---

## 4. Functional Requirements

### 4.1 Core Requirements (Must Have)

#### FR-001: Tournament Bracket Visualization
- **Priority:** P0 (Critical)
- **Description:** Display the tournament progression from initial rounds to championship
- **Acceptance Criteria:**
  - Shows all rounds clearly
  - Winners are visually indicated
  - Flow from early to late rounds is intuitive
- **Suggested Chart Types:** Sankey diagram, Mermaid flowchart, tree diagram

#### FR-002: Vote Distribution Visualization
- **Priority:** P0 (Critical)
- **Description:** Show how votes were distributed across competitors
- **Acceptance Criteria:**
  - Vote counts are accurate
  - Comparisons between competitors are clear
  - Data is labeled and easy to read
- **Suggested Chart Types:** Bar charts, pie/donut charts, stacked bars

#### FR-003: Recipe Attribute Comparison
- **Priority:** P0 (Critical)
- **Description:** Compare recipes across multiple dimensions (taste, presentation, creativity, etc.)
- **Acceptance Criteria:**
  - Multiple attributes shown simultaneously
  - Top recipes are easily identifiable
  - Visual differences are clear
- **Suggested Chart Types:** Radar/spider charts, grouped bar charts

#### FR-004: Additional Insights
- **Priority:** P1 (High)
- **Description:** Any additional visualizations that enhance storytelling
- **Acceptance Criteria:**
  - Provides meaningful context
  - Complements other visualizations
  - Easy to understand
- **Suggested Chart Types:** Treemaps, chord diagrams, line charts (trends)

### 4.2 Bonus Requirements (Nice to Have)

#### FR-005: Multiple Chart Type Variety (Beginner)
- **Priority:** P2 (Medium)
- **Description:** Create 5+ different visualization types from the same dataset
- **Acceptance Criteria:**
  - Minimum 5 distinct chart types
  - Each chart provides unique perspective
  - All charts use same source data

#### FR-006: What-If Scenario Analysis (Intermediate)
- **Priority:** P2 (Medium)
- **Description:** Generate alternative outcome visualizations
- **Acceptance Criteria:**
  - Shows hypothetical tournament outcomes
  - Clearly labeled as "what-if" scenarios
  - Maintains data integrity

#### FR-007: Synthetic Tournament Generation (Advanced)
- **Priority:** P3 (Low)
- **Description:** Generate new 16-recipe tournament with realistic patterns
- **Acceptance Criteria:**
  - 16 unique recipes with creative names
  - Realistic voting distributions
  - Complete tournament bracket
  - Multiple visualizations of generated data

---

## 5. Non-Functional Requirements

### 5.1 Performance
- **NFR-001:** Visualizations must render within Goose conversation in < 5 seconds
- **NFR-002:** Charts must be responsive and interactive

### 5.2 Usability
- **NFR-003:** No coding required from user perspective
- **NFR-004:** Natural language descriptions should generate appropriate charts
- **NFR-005:** Charts must be understandable to non-technical audience

### 5.3 Quality
- **NFR-006:** All visualizations must be presentation-ready quality
- **NFR-007:** Data must be accurately represented (no distortions)
- **NFR-008:** Color schemes should be festival-appropriate and accessible

### 5.4 Compatibility
- **NFR-009:** Charts must render in Goose Desktop application
- **NFR-010:** Visualizations should be exportable/screenshot-able for ceremony display

---

## 6. Technical Architecture

### 6.1 System Components

```
┌─────────────────────────────────────────────────┐
│           Goose Desktop Application              │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │   Auto-Visualiser Extension (MCP-UI)     │  │
│  ├──────────────────────────────────────────┤  │
│  │  - render_sankey                         │  │
│  │  - render_radar                          │  │
│  │  - render_donut                          │  │
│  │  - render_treemap                        │  │
│  │  - render_chord                          │  │
│  │  - render_map                            │  │
│  │  - render_mermaid                        │  │
│  │  - show_chart (line/scatter/bar)         │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │   LLM Processing (Claude Sonnet 4.5)     │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │   Data Input (tournament_data.md)        │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
└─────────────────────────────────────────────────┘
```

### 6.2 Technology Stack
- **Platform:** Goose Desktop
- **Extension:** Auto-Visualiser (MCP-UI based)
- **LLM Provider:** OpenRouter (Claude Sonnet 4.5)
- **Data Format:** Markdown (tournament_data.md)
- **Output Format:** Interactive UI components

### 6.3 MCP-UI Integration
- Uses Model Context Protocol extension for UI components
- Charts render directly in conversation thread
- No separate windows or export steps required
- Interactive components support user exploration

---

## 7. Data Requirements

### 7.1 Input Data
- **Source:** tournament_data.md (attached to email)
- **Expected Contents:**
  - Tournament bracket structure
  - Judge scorecards
  - Vote breakdowns
  - Recipe attributes
  - Competitor information

### 7.2 Data Quality
- All vote counts must be accurate
- Recipe attributes should be normalized/comparable
- Tournament progression must be logically consistent

### 7.3 Data Privacy
- No personal information about judges required
- Focus on aggregate results

---

## 8. User Experience Requirements

### 8.1 Interaction Model
1. User enables Auto-Visualiser extension in Goose Settings
2. User pastes tournament data into conversation
3. User describes desired visualization in natural language
4. Goose generates appropriate chart automatically
5. Chart renders inline in conversation
6. User can request modifications or additional charts

### 8.2 User Commands (Examples)
- "Create a tournament bracket showing the progression"
- "Show me a radar chart comparing the top 4 recipes"
- "Visualize the vote distribution for the championship match"
- "Make a sankey diagram of the tournament flow"

### 8.3 Output Quality Standards
- Charts must be ceremony-appropriate (professional appearance)
- Labels must be clear and readable
- Colors should be distinguishable
- Legends/keys must be present where needed

---

## 9. Success Metrics

### 9.1 Primary Metrics
- **Metric 1:** All 3 core visualizations created ✓
- **Metric 2:** Charts are presentation-ready quality ✓
- **Metric 3:** Tournament story is clearly communicated ✓
- **Metric 4:** Delivered within 18-hour deadline ✓

### 9.2 Bonus Metrics
- **Metric 5:** 5+ different chart types created (Beginner)
- **Metric 6:** What-if scenarios generated (Intermediate)
- **Metric 7:** New tournament generated and visualized (Advanced)

### 9.3 Quality Metrics
- Zero data visualization errors
- Stakeholder approval obtained
- Positive ceremony feedback
- Charts enhance audience understanding

---

## 10. Implementation Plan

### 10.1 Phase 1: Setup (5 minutes)
- [ ] Open Goose Desktop
- [ ] Navigate to Settings → Extensions
- [ ] Enable "Auto Visualiser" extension
- [ ] Verify extension is active

### 10.2 Phase 2: Core Deliverables (30-60 minutes)
- [x] Obtain tournament_data.md
- [x] Create tournament bracket visualization (FR-001)
- [x] Create vote distribution chart (FR-002)
- [x] Create recipe attribute comparison (FR-003)
- [x] Create additional insights visualization (FR-004)

### 10.3 Phase 3: Quality Review (15 minutes)
- [ ] Verify all data is accurate
- [ ] Check chart readability
- [ ] Ensure presentation quality
- [ ] Test screenshots/exports

### 10.4 Phase 4: Bonus Challenges (Optional)
- [ ] Create 5+ chart variations (Beginner - 30 min)
- [ ] Generate what-if scenarios (Intermediate - 45 min)
- [ ] Create synthetic tournament (Advanced - 90 min)

### 10.5 Phase 5: Submission
- [ ] Screenshot visualizations
- [ ] Post to Advent of AI Discussion (Day 3)
- [ ] Optional: Share on social media/blog

---

## 11. Risks and Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Auto-Visualiser extension not available | High | Low | Verify extension in marketplace before starting |
| LLM credits insufficient | High | Medium | Use provided access code (ADVENTDAY3) at goose-credits.dev |
| Tournament data incomplete | High | Low | Request clarification from stakeholder immediately |
| Chart types not suitable | Medium | Medium | Try multiple chart types, use natural language to iterate |
| Time constraint too tight | Medium | Low | Focus on P0 requirements first, bonus items if time permits |
| Charts not rendering properly | Medium | Low | Check extension status, restart Goose if needed |

---

## 12. Dependencies

### 12.1 External Dependencies
- Goose Desktop application installed
- Auto-Visualiser extension available in marketplace
- OpenRouter account with credits (or use provided access code)
- Tournament data from Sarah Chen

### 12.2 Technical Dependencies
- MCP-UI protocol support
- Internet connection for LLM API calls
- Sufficient system resources for chart rendering

---

## 13. Acceptance Criteria

### 13.1 Definition of Done
A submission is complete when:
1. ✅ Auto-visualiser extension is enabled
2. ✅ 3+ visualizations created from email data
3. ✅ Tournament story understandable from charts alone
4. ✅ Solution submitted to Advent of AI Discussion (Day 3)

### 13.2 Quality Gates
- Charts accurately represent source data
- Visualizations are presentation-ready
- No technical errors in rendering
- Stakeholder would approve for ceremony use

---

## 14. Documentation Requirements

### 14.1 User Documentation
- Screenshots of final visualizations
- Brief description of each chart's purpose
- Any insights discovered during analysis

### 14.2 Submission Documentation
- Post in Advent of AI Discussion (Day 3)
- Include screenshots or links
- Optional: Blog post or social media share

---

## 15. Future Considerations

### 15.1 Potential Enhancements
- Real-time visualization during live tournaments
- Integration with voting systems
- Automated report generation
- Multiple language support for international festivals

### 15.2 Reusability
- Template approach for future festivals
- Standardized data formats
- Visualization library for different event types

---

## 16. References

### 16.1 Technical Documentation
- [MCP-UI Guide](https://modelcontextprotocol.io/docs/concepts/ui)
- [Auto-Visualiser Docs](https://github.com/block/goose/tree/main/extensions/autovisualiser)
- [How It Works Blog](https://block.github.io/goose/blog/mcp-ui/)

### 16.2 Project Resources
- Challenge URL: https://adventofai.dev/challenges/3
- Credit Access: https://goose-credits.dev (Code: ADVENTDAY3)
- Discussion Forum: Advent of AI Discussion (Day 3)

---

## 17. Appendix

### 17.1 Glossary
- **MCP-UI:** Model Context Protocol UI extension - allows AI to return interactive UI components
- **Auto-Visualiser:** Goose extension for automatic data visualization
- **Sankey Diagram:** Flow diagram showing progression between stages
- **Radar Chart:** Multi-axis chart showing multiple variables simultaneously
- **OpenRouter:** LLM API provider service

### 17.2 Chart Type Selection Guide

| Data Type | Recommended Chart | Purpose |
|-----------|------------------|---------|
| Tournament progression | Sankey, Mermaid flowchart | Show flow from rounds to winner |
| Vote counts | Bar, donut/pie | Compare quantities |
| Multi-attribute comparison | Radar/spider | Compare across dimensions |
| Relationships | Chord diagram | Show connections |
| Hierarchical data | Treemap | Show nested categories |
| Trends over time | Line chart | Show changes |
| Geographic data | Map | Show locations |

### 17.3 Natural Language Prompt Examples

**For Tournament Bracket:**
- "Create a Sankey diagram showing the hot cocoa tournament bracket from quarterfinals to championship"
- "Show me a Mermaid flowchart of the tournament progression with winners highlighted"

**For Vote Distribution:**
- "Make a bar chart comparing final vote counts for the top 4 competitors"
- "Create a donut chart showing the vote percentage breakdown in the championship round"

**For Recipe Comparison:**
- "Generate a radar chart comparing taste, presentation, creativity, and aroma scores for the finalists"
- "Show a grouped bar chart of all judges' scores across recipes"

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Dec 3, 2025 | AI Engineering Team | Initial PRD creation |

---

**Approval:**

- [ ] Product Owner: _______________
- [ ] Technical Lead: _______________
- [ ] Stakeholder (Sarah Chen): _______________

