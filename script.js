/* ----- Din eksisterende kode ----- */
document.addEventListener('DOMContentLoaded', () => {
    const toggleIcon = document.querySelector('.svg-icon');
    const aside = document.querySelector('.aside-container');
    const asidenav = document.querySelector('.asidenav-container');
    const gamblebox = document.querySelector('#casinohome');
    const gamblebox2 = document.querySelector('#basketball');
    const netslogo = document.getElementById("netslogo");
    const intro = document.querySelector('.introduction');
    const homecontainer = document.querySelector('.home-container');

    // Hvis .home-container ikke findes i HTML, så undgå fejl
    if(homecontainer) {
      toggleIcon.addEventListener('click', () => {
          aside.classList.toggle('expanded');
          gamblebox.classList.toggle('expanded');
          gamblebox2.classList.toggle('expanded');
          intro.classList.toggle('shifted');

          if (aside.classList.contains('expanded')) {
              netslogo.style.marginLeft = "300px";
              asidenav.style.flexDirection = "row";
              homecontainer.style.marginLeft = "300px";
          } else {
              netslogo.style.marginLeft = "0";
              asidenav.style.flexDirection = "column";
              homecontainer.style.marginLeft = "0";
          }
      });
    }
});

document.querySelectorAll('.catalog-class').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.catalog-class').forEach(el => el.classList.remove('active'));
      item.classList.add('active');
    });
});





document.addEventListener('DOMContentLoaded', () => {
    const boardElement = document.getElementById('board');
    const betAmountInput = document.getElementById('betAmount');
    const numMinesInput = document.querySelector('.numMinesdrop');
    const betButton = document.querySelector('.betButton');
  
    const boardSize = 5; 
    let board = [];
    let minePositions = [];
    let revealedCount = 0;
    let gameActive = false;
  
    function createBoard() {
      boardElement.innerHTML = '';
      board = [];
      revealedCount = 0;
  
      for (let i = 0; i < boardSize * boardSize; i++) {
        const cell = document.createElement('div');
        cell.classList.add('mines-cell');
        cell.dataset.index = i;
        boardElement.appendChild(cell);
  
        board.push({
          isMine: false,
          isRevealed: false,
          element: cell
        });
      }
    }
  
    function placeMines(numMines) {
      minePositions = [];
      while (minePositions.length < numMines) {
        const index = Math.floor(Math.random() * board.length);
        if (!board[index].isMine) {
          board[index].isMine = true;
          minePositions.push(index);
        }
      }
    }
  
    function revealCell(index) {
      const cell = board[index];
      if (cell.isRevealed || !gameActive) return;
  
      cell.isRevealed = true;
      cell.element.classList.add('revealed');
  
      if (cell.isMine) {
        cell.element.classList.add('mine');
        endGame(false); 
      } else {
        cell.element.classList.add('safe');
        revealedCount++;
  
        if (revealedCount === board.length - minePositions.length) {
          endGame(true);
        }
      }
    }
  
    function enableManualPlay() {
      board.forEach((cell, index) => {
        cell.element.onclick = () => revealCell(index);
      });
    }
  
    function startGame() {
      const betAmount = parseFloat(betAmountInput.value);
      const numMines = parseInt(numMinesInput.value, 10);
  
      if (isNaN(betAmount) || betAmount <= 0) {
        alert("Indtast et gyldigt beløb større end 0!");
        return;
      }
      if (isNaN(numMines) || numMines <= 0 || numMines >= boardSize * boardSize) {
        alert("Vælg et gyldigt antal miner!");
        return;
      }
  
      gameActive = true;
      createBoard();
      placeMines(numMines);
      enableManualPlay();
    }
  
    function endGame(won) {
      gameActive = false;
  
      board.forEach(cell => {
        cell.element.onclick = null;
        if (cell.isMine) {
          cell.element.classList.add('mine');
        }
      });
  
      alert(won ? 'Tillykke, du vandt!' : 'Du ramte en mine. Tryk "Bet" for at starte forfra.');
    }
  
    betButton.addEventListener('click', startGame);
  
    createBoard();
  });
  