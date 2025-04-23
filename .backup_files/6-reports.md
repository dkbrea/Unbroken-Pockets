<summary_title>
Financial Cash Flow Analysis Dashboard with Sankey Diagram Visualization
</summary_title>

<image_analysis>
1. Content Structure:
- Main Content Elements: Financial metrics cards, Sankey diagram, category breakdown
- Content Grouping: Top summary metrics, detailed flow visualization below
- Visual Hierarchy: Summary KPIs > Flow Diagram > Category Details
- Content Types: Numeric data, percentages, flow diagram, icons, labels
- Text Elements: Category labels, monetary values, percentages, metric titles

2. Layout Structure:
- Content Distribution: Horizontal metric cards row, full-width Sankey diagram
- Spacing Patterns: Consistent padding between cards, clear section separation
- Container Structure: Card containers for metrics, bounded flow diagram
- Grid/Alignment: 4-column grid for metrics, centered flow diagram
- Responsive Behavior: Cards stack on mobile, diagram scales horizontally

3. UI Components (Page-Specific):
- Content Cards: 4 summary metric cards (Income, Expenses, Net Income, Savings Rate)
- Interactive Elements: Category & group dropdown, view toggle buttons
- Data Display Elements: Sankey diagram, percentage indicators
- Status Indicators: Category colors, flow direction indicators
- Media Components: Category icons, flow visualization

4. Interactive Patterns:
- Content Interactions: Hoverable flow sections, category selection
- State Changes: Active/hover states for flow sections
- Dynamic Content: Flow updates based on date/filter selection
- Mobile Interactions: Touch-friendly category selection, scrollable visualization

</image_analysis>

<development_planning>
1. Component Structure:
- MetricCard component for summary statistics
- SankeyDiagram component for flow visualization
- CategoryList component for breakdown
- FilterControls component for view options

2. Content Layout:
- Flexbox grid for metric cards
- CSS Grid for main layout structure
- Responsive breakpoints for mobile adaptation
- Dynamic height calculation for flow diagram

3. Integration Points:
- Financial data API integration
- Theme system for flow colors
- Shared icon component library
- Real-time data updates

4. Performance Considerations:
- Lazy loading for Sankey visualization
- Cached category calculations
- Optimized flow rendering
- Debounced filter updates
</development_planning>