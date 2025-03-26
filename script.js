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



const boardSize = 5;    
let board = [];            
let minePositions = [];   
let revealedCount = 0;     
let autoRevealInterval = null;

const boardElement = document.getElementById('board');
const betAmountInput = document.getElementById('betAmount');
const numMinesInput = document.getElementById('numMines');
const startManualBtn = document.getElementById('startManualBtn');
const startAutoBtn = document.getElementById('startAutoBtn');

if (boardElement && startManualBtn && startAutoBtn) {
  startManualBtn.addEventListener('click', () => {
    newGame(true);
  });

  startAutoBtn.addEventListener('click', () => {
    newGame(false);
  });

  createBoard();
  placeMines(parseInt(numMinesInput.value, 10));
  enableManualPlay();
}


function createBoard() {
  boardElement.innerHTML = "";
  board = [];
  revealedCount = 0;

  for (let i = 0; i < boardSize * boardSize; i++) {
    board.push({
      isMine: false,
      isRevealed: false,
      element: null
    });
  }

  board.forEach((cell, index) => {
    const cellDiv = document.createElement("div");
    cellDiv.classList.add("mines-cell");
    cellDiv.dataset.index = index;
    boardElement.appendChild(cellDiv);
    board[index].element = cellDiv;
  });
}


function placeMines(numMines) {
  minePositions = [];
  let placed = 0;
  while (placed < numMines) {
    const randomIndex = Math.floor(Math.random() * board.length);
    if (!board[randomIndex].isMine) {
      board[randomIndex].isMine = true;
      minePositions.push(randomIndex);
      placed++;
    }
  }
}


function revealCell(index) {
  const cell = board[index];
  if (cell.isRevealed) return;

  cell.isRevealed = true;
  revealedCount++;

  cell.element.classList.add("revealed");
  cell.element.classList.add(cell.isMine ? "mine" : "safe");
//   cell.element.textContent = cell.isMine ? "💣" : "";

  if (cell.isMine) {
    gameOver(false);
  } else {
    if (revealedCount === board.length - minePositions.length) {
      gameOver(true);
    }
  }
}

function enableManualPlay() {
  board.forEach((cellObj, index) => {
    cellObj.element.onclick = () => {
      revealCell(index);
    };
  });
}

function startAutoPlay() {
  board.forEach((cellObj) => {
    cellObj.element.onclick = null;
  });

  if (autoRevealInterval) {
    clearInterval(autoRevealInterval);
  }

  autoRevealInterval = setInterval(() => {
    const unrevealedIndices = board
      .map((cellObj, idx) => (!cellObj.isRevealed ? idx : null))
      .filter((val) => val !== null);

    if (unrevealedIndices.length === 0) {
      stopAutoPlay();
      return;
    }

    const randomIndex = Math.floor(Math.random() * unrevealedIndices.length);
    const cellIndex = unrevealedIndices[randomIndex];
    revealCell(cellIndex);
  }, 1000); 
}


function stopAutoPlay() {
  if (autoRevealInterval) {
    clearInterval(autoRevealInterval);
    autoRevealInterval = null;
  }
}


function newGame(isManual) {
  stopAutoPlay();
  createBoard();
  placeMines(parseInt(numMinesInput.value, 10));

  if (isManual) {
    enableManualPlay();
  } else {
    startAutoPlay();
  }
}


function gameOver(didWin) {
  board.forEach((cellObj) => {
    cellObj.element.classList.add("disabled");
    if (!didWin && cellObj.isMine) {
      cellObj.element.classList.add("mine");
    //   cellObj.element.textContent = "💣";
    }
  });

  stopAutoPlay();

  if (didWin) {
    alert("Tillykke, du vandt!");
  } else {
    alert("Du ramte en mine. Bedre held næste gang!");
  }
}