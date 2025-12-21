# Six Degrees of Wikipedia - Frontend

Frontend application for the Six Degrees of Wikipedia project, built with React + TypeScript + Vite.

## Features

- 🔍 **Searchable Person Selection**: Autocomplete dropdowns with server-side search
- 🔗 **Real-time Pathfinding**: WebSocket connection to Rails backend for live pathfinding updates
- 📊 **Network Visualization**: Interactive graph visualization using Sigma.js
- 📝 **Search Log**: Real-time log of pathfinding progress
- 🎨 **Modern UI**: Dark theme with Tailwind CSS

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TanStack Query (React Query)** - Data fetching and caching
- **Sigma.js + Graphology** - Graph visualization
- **ActionCable** - WebSocket communication with Rails backend
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## Prerequisites

- Node.js 20.19.0+ (or 22.12.0+)
- npm or yarn
- Rails backend running on `http://localhost:3000`

## Installation

```bash
# Install dependencies
npm install
```

## Development

```bash
# Start dev server (runs on http://localhost:5173)
npm run dev
```

The dev server will proxy API requests to the Rails backend:
- `/api/*` → `http://localhost:3000/api/*`
- `/cable` (WebSocket) → `ws://localhost:3000/cable`

## Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Create a `.env` file to override the API base URL:

```env
VITE_API_BASE_URL=http://localhost:3000
```

If not set, the app will:
- Use same-origin in production
- Use `http://localhost:3000` when running Vite dev server (port 5173)

## Project Structure

```
src/
├── main.tsx              # Entry point
├── App.tsx               # Main app component
├── index.css            # Global styles (Tailwind)
├── types/
│   └── index.ts         # TypeScript type definitions
├── services/
│   └── api.ts           # API client & React Query hooks
├── hooks/
│   └── useWebSocket.ts  # ActionCable WebSocket hook
└── components/
    ├── SearchBar.tsx              # Search controls
    ├── SearchableDropdown.tsx     # Autocomplete dropdown
    ├── LogViewer.tsx              # Search log display
    └── NetworkVisualization.tsx   # Graph visualization
```

## API Endpoints

The frontend expects the following Rails API endpoints:

- `GET /api/people?q=...` - Search people (returns `Person[]`)
- `GET /api/graph` - Get full graph adjacency map (returns `AdjacencyMap`)
- WebSocket `/cable` - ActionCable endpoint for pathfinding

## WebSocket Protocol

The app uses ActionCable to communicate with the Rails backend:

1. **Subscribe** to `PathfindingChannel`
2. **Send search request**: `{ action: 'search', start_node: '...', end_node: '...' }`
3. **Receive messages**:
   - `node_explored` - Node explored during BFS
   - `level_explored` - Level completed
   - `path_found` - Path found with result
   - `error` - Error occurred
   - `timeout` - Connection timeout

## Notes

- The graph visualization loads the full graph from `/api/graph` on mount
- Graph can be very large (500K+ lines), so loading may take time
- WebSocket connection has a 15-second timeout (configured on backend)
- All API calls include CORS headers (configured on Rails backend)

## Troubleshooting

### WebSocket connection fails
- Ensure Rails backend is running on port 3000
- Check that ActionCable is properly configured in Rails
- Verify CORS settings allow WebSocket connections

### Graph not loading
- Check browser console for errors
- Verify `/api/graph` endpoint is accessible
- Graph file may be very large - be patient

### API calls fail
- Ensure Rails backend is running
- Check CORS configuration in Rails
- Verify API endpoints match expected format


<img width="1891" height="920" alt="image" src="https://github.com/user-attachments/assets/29d79f35-c7e3-4c0b-862e-b8a7d4667bde" />
