import GameCard from './GameCard'

function GameList({ games, onJoin, onCancel, onCreateClick }) {
  if (games.length === 0) {
    return (
      <div className="empty-state">
        <p>Пока нет ни одной игры.</p>
        <button className="primary-button" onClick={onCreateClick}>
          Создать игру
        </button>
      </div>
    )
  }

  return (
    <ul className="game-list">
      {games.map((game, index) => (
        <GameCard
          key={game.id}
          game={game}
          onJoin={onJoin}
          onCancel={onCancel}
          featured={index === 0}
        />
      ))}
    </ul>
  )
}

export default GameList
