/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import ChatInterface from './components/ChatInterface';
import { GameProvider } from './contexts/GameContext';

export default function App() {
  return (
    <GameProvider>
      <div className="min-h-screen bg-[#050505]">
        <ChatInterface />
      </div>
    </GameProvider>
  );
}
