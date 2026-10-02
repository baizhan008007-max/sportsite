import GameCard from './GameCard'

function GameList({ games, user, onJoin, onCancel, onSignIn, onCreateClick }) {
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
          user={user}
          isOwner={Boolean(user) && game.owner_id === user.id}
          onJoin={onJoin}
          onCancel={onCancel}
          onSignIn={onSignIn}
          featured={index === 0}
        />
      ))}
    </ul>
  )
}

export default GameList
