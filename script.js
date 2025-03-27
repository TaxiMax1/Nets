const supabaseClient = supabase.createClient(
    "https://wfljnalhyeyohgltmgfl.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmbGpuYWxoeWV5b2hnbHRtZ2ZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMzAwMTksImV4cCI6MjA1ODYwNjAxOX0.36SQpA7FxFRQ8TmxcQGKOA8wbd0EdcT6QRw1yP0SCuE"
  );

document.addEventListener('DOMContentLoaded', () => {
    const toggleIcon = document.querySelector('.svg-icon');
    const aside = document.querySelector('.aside-container');
    const asidenav = document.querySelector('.asidenav-container');
    const gamblebox = document.querySelector('#casinohome');
    const gamblebox2 = document.querySelector('#basketball');
    const netslogo = document.getElementById("netslogo");
    const intro = document.querySelector('.introduction');
    const homecontainer = document.querySelector('.home-container');
  
    if (homecontainer && toggleIcon) {
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
    let currentBetAmount = 0;
    let totalSafeCells = 0;
  
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
  
    function enableManualPlay() {
      board.forEach((cell, index) => {
        cell.element.onclick = () => revealCell(index);
      });
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
  
    async function startGame() {
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
  
      const { data: sessionData } = await supabaseClient.auth.getSession();
      const email = sessionData?.session?.user?.email;
  
      if (!email) {
        alert("Du skal være logget ind for at spille.");
        return;
      }
  
      const { data: user, error: balanceError } = await supabaseClient
        .from("users")
        .select("balance")
        .eq("email", email)
        .maybeSingle();
  
      if (balanceError || !user) {
        alert("Kunne ikke hente din saldo.");
        return;
      }
  
      const balance = user.balance ?? 0;
  
      if (betAmount > balance) {
        alert("Du har ikke nok penge til dette bet.");
        return;
      }
  
      const { error: updateError } = await supabaseClient
        .from("users")
        .update({ balance: balance - betAmount })
        .eq("email", email);
  
      if (updateError) {
        alert("Kunne ikke opdatere saldo.");
        return;
      }
  
      // Start game
      gameActive = true;
      currentBetAmount = betAmount;
      createBoard();
      placeMines(numMines);
      enableManualPlay();
  
      totalSafeCells = board.length - minePositions.length;
  
      betButton.innerHTML = "<span>Cashout</span>";
      betButton.onclick = cashOutGame;
  
      updateUIOnLogin();
    }
  
    async function cashOutGame() {
      const { data: sessionData } = await supabaseClient.auth.getSession();
      const email = sessionData?.session?.user?.email;
      if (!email) return;
  
      const baseReward = currentBetAmount;
      const successRatio = revealedCount / totalSafeCells;
      const multiplier = 1.5;
      const payout = baseReward + (baseReward * successRatio * multiplier);
  
      const { data: user, error } = await supabaseClient
        .from("users")
        .select("balance")
        .eq("email", email)
        .maybeSingle();
  
      if (error || !user) return alert("Kunne ikke finde bruger.");
  
      const newBalance = (user.balance ?? 0) + payout;
  
      const { error: updateError } = await supabaseClient
        .from("users")
        .update({ balance: newBalance })
        .eq("email", email);
  
      if (updateError) return alert("Kunne ikke opdatere saldo.");
  
    //   alert(`Du har cashet ud og vundet $${payout.toFixed(2)}!`);
      updateUIOnLogin();
      resetGame();
    }
  
    function endGame(won) {
      gameActive = false;
  
      board.forEach(cell => {
        cell.element.onclick = null;
        if (cell.isMine) {
          cell.element.classList.add('mine');
        }
      });
  
      alert(won ? "Tillykke, du vandt!" : "Du ramte en mine.");
      resetGame();
    }
  
    function resetGame() {
      currentBetAmount = 0;
      betButton.innerHTML = "<span>Bet</span>";
      betButton.onclick = startGame;
      createBoard();
    }
  
    if (betButton) betButton.addEventListener('click', startGame);
    createBoard();
  });
  


  
  function openModal() {
    document.getElementById("modal").style.display = "block";
  }
  function closeModal() {
    document.getElementById("modal").style.display = "none";
  }
  function openLogin() {
    document.getElementById("modalLogin").style.display = "block";
  }
  function closeLogin() {
    document.getElementById("modalLogin").style.display = "none";
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    const registerBtn = document.querySelector(".signup-button");
    const loginBtn = document.querySelector(".login-submit-button");
  
    if (registerBtn) registerBtn.addEventListener("click", handleRegister);
    if (loginBtn) loginBtn.addEventListener("click", handleLogin);
  
    updateUIOnLogin();
  });
  
  // ✅ REGISTER funktion
  async function handleRegister() {
    const emailInput = document.querySelector('[data-test="register-email"]').value.trim().toLowerCase();
    const password = document.querySelector('[data-test="register-password"]').value;
    const username = document.querySelector('[data-test="register-name"]').value;
    const dob = document.querySelector('[data-test="register-dob"]').value;
  
    if (!emailInput || !password || !username || !dob) {
      alert("Please fill in all fields.");
      return;
    }
  
    const { data: signUpData, error: authError } = await supabaseClient.auth.signUp({
      email: emailInput,
      password
    });
  
    if (authError) return alert("Auth failed: " + authError.message);
  
    const finalEmail = signUpData?.user?.email ?? emailInput;
  
    const { error: dbError } = await supabaseClient.from("users").insert([
      {
        email: finalEmail,
        username,
        password,
        balance: 0,
        created_at: new Date()
      }
    ]);
  
    if (dbError) return alert("DB insert error: " + dbError.message);
  
    alert("Account created! Check your email.");
    closeModal();
  }  
  
  // ✅ LOGIN funktion
  async function handleLogin() {
    const input = document.querySelector('[data-test="login-username"]')?.value;
    const password = document.querySelector('[data-test="login-password"]')?.value;
  
    if (!input || !password) return alert("Enter both fields");
  
    let emailToUse = input;
  
    if (!input.includes("@")) {
      const { data: userMatch, error } = await supabaseClient
        .from("users")
        .select("email")
        .eq("username", input)
        .single();
  
      if (error || !userMatch?.email) return alert("User not found");
      emailToUse = userMatch.email;
    }
  
    const { error: loginError } = await supabaseClient.auth.signInWithPassword({
      email: emailToUse,
      password,
    });
  
    if (loginError) return alert("Login failed: " + loginError.message);
  
    closeLogin();
    updateUIOnLogin();
  }

  const logoutBtn = document.querySelector(".logout-button");
  if (logoutBtn) logoutBtn.addEventListener("click", handleLogout);


  async function handleLogout() {
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
      alert("Logout fejlede: " + error.message);
      return;
    }
  
    updateUIOnLogin(); 
  }  
  
  async function updateUIOnLogin() {
    const { data: sessionData } = await supabaseClient.auth.getSession();
  
    const loginBtn = document.querySelector(".login-button");
    const registerBtn = document.querySelector(".register-button");
    const registerBtn2 = document.querySelector(".main-register-button");
    const balanceDisplay = document.querySelector(".balance-display");
    const balanceWallet = document.querySelector(".balance-wallet");
    const logoutButton = document.querySelector(".logout-button");
  
    if (!sessionData?.session?.user) {
      if (loginBtn) {
        loginBtn.innerText = "Login";
        loginBtn.style.display = "inline-block";
        loginBtn.onclick = openLogin;
      }
      if (registerBtn) registerBtn.style.display = "inline-block";
      if (balanceDisplay) balanceDisplay.style.display = "none";
      if (balanceWallet) balanceWallet.style.display = "none";
      if (logoutButton) logoutButton.style.display = "none";
      return;
    }
  
    const email = sessionData.session.user.email;
  
    const { data: user, error: balanceError } = await supabaseClient
      .from("users")
      .select("balance")
      .eq("email", email)
      .maybeSingle();
  
    if (balanceError) {
      console.error("Balance fetch failed:", balanceError.message);
      return;
    }
  
    if (!user) {
      console.warn("No user found for email:", email);
      return;
    }

    console.log("Fetching balance for email:", email);
    console.log("Users found?", user);
  
    const balance = user.balance ?? 0;
  
    if (balanceDisplay) {
      balanceDisplay.innerText = `$${balance}`;
      balanceDisplay.style.display = "inline-block";
    }

    if (balanceWallet) {
      balanceWallet.style.display = "inline-block"
    }

    if (logoutButton) {
        logoutButton.style.display = "inline-block"
    }
  
    if (loginBtn) loginBtn.style.display = "none";
    if (registerBtn) registerBtn.style.display = "none";
    // if (registerBtn2) registerBtn2.style.display = "none";
  }  