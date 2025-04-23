<summary_title>
Investment Portfolio Performance Dashboard with Market Comparison
</summary_title>

<image_analysis>
1. Content Structure:
- Main Content Elements: Performance metrics cards, comparative line chart, holdings section
- Content Grouping: Performance metrics grouped by timeframe and index type
- Visual Hierarchy: Performance cards > Chart > Holdings section
- Content Types: Numerical data, percentages, line chart, text labels
- Text Elements: Section headings, percentage values, time period labels, chart legends

2. Layout Structure:
- Content Distribution: Three main sections vertically stacked
- Spacing Patterns: Consistent padding between cards, chart margins
- Container Structure: Card containers for metrics, chart container, holdings container
- Grid/Alignment: 4-column grid for performance cards, full-width chart
- Responsive Behavior: Cards stack on mobile, chart scales horizontally

3. UI Components (Page-Specific):
- Content Cards: Performance metric cards with past/current values
- Interactive Elements: Time period selectors, chart legend toggles
- Data Display Elements: Percentage displays, line chart
- Status Indicators: Active/inactive state for time periods
- Media Components: Line chart visualization

4. Interactive Patterns:
- Content Interactions: Time period selection, chart data point hover
- State Changes: Active tab highlighting, chart hover states
- Dynamic Content: Real-time data updates for performance metrics
- Mobile Interactions: Touch-friendly time period selectors, pinch-zoom chart

</image_analysis>

<development_planning>
1. Component Structure:
- PerformanceCard component for metric displays
- ChartComponent for performance visualization
- HoldingsSection for portfolio items
- TimeSelector for period filtering
- Required props: performance data, time periods, comparison data
- State: selected time period, active comparisons

2. Content Layout:
- Flexbox grid for performance cards
- CSS Grid for responsive layouts
- Consistent spacing system
- Dynamic height adjustments for chart

3. Integration Points:
- Theme variables for colors and typography
- Shared chart components
- Common metric formatting utilities
- Real-time data update hooks

4. Performance Considerations:
- Lazy loading for chart data
- Throttled updates for real-time data
- Chart rendering optimization
- Memoized performance calculations
</development_planning>