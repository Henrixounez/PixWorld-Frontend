export default function ModalProblem() {
  return (
    <>
      <h3>Connection lost with the server - Connexion perdue avec le serveur</h3>
      <hr/>
      Please refresh the page - Veuillez rafraichir la page
      <br/>
      <br/>
      <button onClick={() => location.reload()}>
        Refresh - Rafraichir
      </button>
    </>
  );
}