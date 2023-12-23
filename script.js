const screenTransitionDuration = 100;
const mainMenu = document.getElementById('mainMenu');
const gameModes = document.getElementById('gameModes');
const settingsScreen = document.getElementById('settingsScreen');
const gameScreen = document.getElementById('gameScreen');
const screenTimeouts = {};
let figuresList = [];
const gridSizeSlider = document.getElementById('gridSizeSlider');
const innerGridSizeSlider = document.getElementById('innerGridSizeSlider');
const nBackSlider = document.getElementById('nBackSlider');
const timeIntervalSlider = document.getElementById('timeIntervalSlider');
const compareModeButtons = document.getElementById('compareModeButtons');
const drawModeButtons = document.getElementById('drawModeButtons');
const reverseModeButtons = document.getElementById('reverseModeButtons');
const selectModeButtons = document.getElementById('selectModeButtons');
const btnCompareShape = compareModeButtons.querySelector('#btnCompareShape');
const btnComparePosition = compareModeButtons.querySelector('#btnComparePosition');
const btnCompareColor = compareModeButtons.querySelector('#btnCompareColor');
const btnDrawReset = drawModeButtons.querySelector('#btnDrawReset');
const btnDrawSubmit = drawModeButtons.querySelector('#btnDrawSubmit');
const sliderReverseNBack = reverseModeButtons.querySelector('#sliderReverseNBack');
const sliderReverseNBackValue = reverseModeButtons.querySelector('#sliderReverseNBackValue');
const btnReverseSubmit = reverseModeButtons.querySelector('#btnReverseSubmit');
const btnSelectSubmit = selectModeButtons.querySelector('#btnSelectSubmit');
const gameGrid = document.getElementById('gameGrid');
let previousScreen = null;
let lastFiguresDisplayed = [];


function saveSettingsToLocalStorage() {
    let settings = {
        gridSize: gridSizeSlider.value,
        innerGridSize: innerGridSizeSlider.value,
        nBack: nBackSlider.value,
        timeInterval: timeIntervalSlider.value
    };
    localStorage.setItem('nBackSettings', JSON.stringify(settings));
}

function loadSettingsFromLocalStorage() {
    let storedSettings = localStorage.getItem('nBackSettings');
    if (storedSettings) {
        let settings = JSON.parse(storedSettings);
        gridSizeSlider.value = settings.gridSize;
        document.getElementById('gridSizeValue').value = settings.gridSize;
        
        innerGridSizeSlider.value = settings.innerGridSize;
        document.getElementById('innerGridSizeValue').value = settings.innerGridSize;
        
        nBackSlider.value = settings.nBack;
        document.getElementById('nBackValue').value = settings.nBack;

        timeIntervalSlider.value = settings.timeInterval;
        document.getElementById('timeIntervalValue').value = settings.timeInterval;
    }
}

function generateEmptyGrid(gridSize) {
    let grid = [];
    for (let i = 0; i < gridSize; i++) {
        let row = [];
        for (let j = 0; j < gridSize; j++) {
            row.push(false);
        }
        grid.push(row);
    }
    return grid;
}

function isAdjacentCellEnabled(figure, i, j, di, dj) {
    const adjacentI = i + di;
    const adjacentJ = j + dj;
    if (adjacentI < 0 || adjacentJ < 0 || adjacentI >= figure.shape.length || adjacentJ >= figure.shape.length) {
        return false;
    }
    return figure.shape[adjacentI][adjacentJ];
}

function displayGameGrid(figures = []) {
    const gridSize = parseInt(gridSizeSlider.value);
    gameGrid.innerHTML = "";
    lastFiguresDisplayed = figures;

    for (let i = 0; i < gridSize; i++) {
        let rowDiv = document.createElement('div');
        rowDiv.className = 'gridRow';
        
        for (let j = 0; j < gridSize; j++) {
            let cellDiv = document.createElement('div');
            cellDiv.className = 'gridCell';
            cellDiv.dataset.x = j;
            cellDiv.dataset.y = i;
            cellDiv.addEventListener('click', function() {
                if (game.gameMode === "select" && game.correctSelectAnswers && game.correctSelectAnswers.length > 0) {
                    this.classList.toggle('selected');
                }
            });
            rowDiv.appendChild(cellDiv);
        }

        gameGrid.appendChild(rowDiv);
    }

    gameGrid.style.width = `${gameGrid.clientHeight}px`;

    if (figures.length > 0) {
        figures.forEach(figure => {
            const div = document.createElement("div");
            div.className = "figureContainer";
            gameGrid.children[figure.y].children[figure.x].appendChild(div);
            const innerGridSize = figure.shape.length;
            for (let i = 0; i < innerGridSize; i++) {
                const row = document.createElement("div");
                row.className = "figureContainerRow";
                div.appendChild(row);
                for (let j = 0; j < innerGridSize; j++) {
                    const currentCell = document.createElement("div");
                    currentCell.className = "innerGridCell";
                    row.appendChild(currentCell);

                    // Has to be present so all cells have an uniform width
                    let figureSize = div.offsetWidth / innerGridSize;
                    const borderWidth = Math.max(Math.min(Math.floor(figureSize / 10), 6), 1);
                    currentCell.style.borderWidth = borderWidth + "px";
                    let radius = borderWidth * 4;
                    if (borderWidth >= 4) {
                        radius = radius + 4;
                    }
                    currentCell.style.borderRadius = radius + "px";

                    if (figure.shape[i][j]) {
                        currentCell.style.backgroundColor = figure.color;
                        currentCell.style.borderImageSource = `url('data:image/svg+xml;utf8,<?xml version="1.0" encoding="UTF-8" ?><svg version="1.1" width="8" height="8" xmlns="http://www.w3.org/2000/svg"><path d="M3 1 h1 v1 h-1 z M4 1 h1 v1 h-1 z M2 2 h1 v1 h-1 z M5 2 h1 v1 h-1 z M1 3 h1 v1 h-1 z M6 3 h1 v1 h-1 z M1 4 h1 v1 h-1 z M6 4 h1 v1 h-1 z M2 5 h1 v1 h-1 z M5 5 h1 v1 h-1 z M3 6 h1 v1 h-1 z M4 6 h1 v1 h-1 z" fill="${figure.color}" /></svg>')`;

                        if (isAdjacentCellEnabled(figure, i, j, -1, 0)) {
                            currentCell.style.borderTopLeftRadius = 0;
                            currentCell.style.borderTopRightRadius = 0;
                        }
                        if (isAdjacentCellEnabled(figure, i, j, 1, 0)) {
                            currentCell.style.borderBottomLeftRadius = 0;
                            currentCell.style.borderBottomRightRadius = 0;
                        }
                        if (isAdjacentCellEnabled(figure, i, j, 0, -1)) {
                            currentCell.style.borderTopLeftRadius = 0;
                            currentCell.style.borderBottomLeftRadius = 0;
                        }
                        if (isAdjacentCellEnabled(figure, i, j, 0, 1)) {
                            currentCell.style.borderTopRightRadius = 0;
                            currentCell.style.borderBottomRightRadius = 0;
                        }
                    }
                }
            }
        });
    }
}



class ShapeSystem {
    constructor() {
        let colors = [];
        for (let i = 0; i < 360; i += 60) {
            colors.push(`hsl(${i}, 75%, 75%)`);
        }
        this.config = {
            colors: colors

        };
    }

    generateRandomShape(excludeList = []) {
        let shape;
        let color;
        const innerGridSize = parseInt(innerGridSizeSlider.value);
        do {
            color = this.getRandomColor();
            shape = [];
            for (let i = 0; i < innerGridSize; i++) {
                let row = [];
                for (let j = 0; j < innerGridSize; j++) {
                    row.push(Math.random() >= 0.5);
                }
                shape.push(row);
            }
        } while (this.isInExcludeList(shape, color, excludeList) || this.isAllFalse(shape));

        return { shape, color };
    }

    isInExcludeList(shape, color, excludeList) {
        for (let i = 0; i < excludeList.length; i++) {
            if (color === excludeList[i].color && this.isEqual(shape, excludeList[i].shape)) return true;
        }
        return false;
    }

    isEqual(shape1, shape2) {
        const innerGridSize = parseInt(innerGridSizeSlider.value);
        for (let i = 0; i < innerGridSize; i++) {
            for (let j = 0; j < innerGridSize; j++) {
                if (shape1[i][j] !== shape2[i][j]) return false;
            }
        }
        return true;
    }

    isAllFalse(shape) {
        const innerGridSize = parseInt(innerGridSizeSlider.value);
        for (let i = 0; i < innerGridSize; i++) {
            for (let j = 0; j < innerGridSize; j++) {
                if (shape[i][j]) return false;
            }
        }
        return true;
    }

    getRandomColor() {
        const randomIndex = Math.floor(Math.random() * this.config.colors.length);
        return this.config.colors[randomIndex];
    }
}

const shapeSystem = new ShapeSystem();

class Game {
    constructor() {
        this.gameState = "stopped"; // can be "running", "paused", or "stopped"
        this.gameMode = null;
        this.streak = 0;
        this.pausedInterval = 0;
        this.gameInterval = null;
        this.highScores = {};
        this.currentHighScore = 0;
        
        let storedHighScore = localStorage.getItem('nBackHighScores');
        if (storedHighScore) {
            this.highScores = JSON.parse(storedHighScore);
        }
    }

    start() {
        const gameMode = this.gameMode;
        const nBack = nBackSlider.value;
        const gridSize = gridSizeSlider.value;
        const innerGridSize = innerGridSizeSlider.value;
        const timeInterval = timeIntervalSlider.value;
        this.currentHighScore = this.getHighScore(gameMode, nBack, gridSize, innerGridSize, timeInterval);
        figuresList = []
        document.getElementById("highScore").innerText = this.currentHighScore;
        document.getElementById("scores").style.display = "flex";
        document.getElementById("pauseOverlay").style.display = "none";
        document.getElementById("startPrompt").style.display = "none";
        document.getElementById("backdrop").style.display = "none";

        if (this.gameState === "stopped") {
            this.gameState = "running";
            this.gameLoop();
        }
        console.log("> Start")
    }

    gameLoop() {
        const timeInterval = parseFloat(timeIntervalSlider.value) * 1000;
        
        if (this.gameState !== "running" || !this.gameMode) return;

        if (this.gameMode === "compare") {
            const gridSize = parseInt(gridSizeSlider.value);
            const x = Math.floor(Math.random() * gridSize);
            const y = Math.floor(Math.random() * gridSize);
            const shape = { x, y, ...shapeSystem.generateRandomShape() };
            if (figuresList.length > parseInt(nBackSlider.value)) {
                const shapeEnabled = btnCompareShape.classList.contains("is-success");
                const positionEnabled = btnComparePosition.classList.contains("is-success");
                const colorEnabled = btnCompareColor.classList.contains("is-success");

                const prevFigure = figuresList.shift();

                const shapeEqual = shapeSystem.isEqual(prevFigure.shape, figuresList[figuresList.length - 1].shape);
                const positionEqual = prevFigure.x === figuresList[figuresList.length - 1].x && prevFigure.y === figuresList[figuresList.length - 1].y;
                const colorEqual = prevFigure.color === figuresList[figuresList.length - 1].color;

                if (shapeEqual === shapeEnabled && positionEqual === positionEnabled && colorEqual === colorEnabled) {
                    this.streak++;
                    document.getElementById("currentScore").innerText = this.streak;
                    console.log("Correct", this.streak)
                } else {
                    this.breakStreak();
                    console.log("Incorrect:", shapeEqual, shapeEnabled, positionEqual, positionEnabled, colorEqual, colorEnabled)
                }
            } else if (figuresList.length === parseInt(nBackSlider.value)) {
                Array.from(compareModeButtons.children).forEach((btn) => {
                    btn.classList.add('is-error');
                    btn.classList.remove('is-disabled');
                });
            }

            Array.from(compareModeButtons.children).forEach((btn) => {
                if (btn.classList.contains("is-success")) {
                    btn.classList.remove('is-success');
                    btn.classList.add('is-error')
                }
            });

            figuresList.push(shape);
            displayGameGrid([shape]);
        } else if (this.gameMode === "reverse") {
            document.documentElement.style.setProperty('--grid-border-color', 'white');
            document.documentElement.style.setProperty('--grid-border-width', "2px");
            btnReverseSubmit.classList.remove("is-primary");
            btnReverseSubmit.classList.add("is-disabled");
            sliderReverseNBack.disabled = true;
            sliderReverseNBackValue.disabled = true;
            sliderReverseNBack.value = 1;
            sliderReverseNBackValue.value = 1;
            if (this.resetButtons) {
                btnReverseSubmit.classList.remove("is-success");
                btnReverseSubmit.classList.remove("is-error");
            }
            const gridSize = parseInt(gridSizeSlider.value);
            const x = Math.floor(Math.random() * gridSize);
            const y = Math.floor(Math.random() * gridSize);
            if (!this.resetButtons || figuresList.length < parseInt(nBackSlider.value) || Math.random() > 0.25) {
                const newFigure = { x, y, ...shapeSystem.generateRandomShape(figuresList) };
                figuresList.push(newFigure);
                displayGameGrid([newFigure]);
                if (figuresList.length > parseInt(nBackSlider.value)) {
                    figuresList.shift();
                }
                this.resetButtons = true;
            } else {
                const oldFigureIndex = Math.floor(Math.random() * (figuresList.length));
                const oldFigure = figuresList[oldFigureIndex];
                displayGameGrid([{ x, y, shape: oldFigure.shape, color: oldFigure.color }]);
                this.correctReverseAnswer = figuresList.length - oldFigureIndex;
                sliderReverseNBack.disabled = false;
                sliderReverseNBackValue.disabled = false;
                btnReverseSubmit.classList.remove("is-disabled");
                btnReverseSubmit.classList.add("is-primary");
                document.documentElement.style.setProperty('--grid-border-color', 'goldenrod');
                document.documentElement.style.setProperty('--grid-border-width', "3px");
                return;
            }
        } else if (this.gameMode === "select") {
            document.documentElement.style.setProperty('--grid-border-color', 'white');
            document.documentElement.style.setProperty('--grid-border-width', "2px");
            btnSelectSubmit.classList.remove("is-primary");
            btnSelectSubmit.classList.add("is-disabled");
            if (this.resetButtons) {
                btnSelectSubmit.classList.remove("is-success");
                btnSelectSubmit.classList.remove("is-error");
            }
            const gridSize = parseInt(gridSizeSlider.value);
            const x = Math.floor(Math.random() * gridSize);
            const y = Math.floor(Math.random() * gridSize);
            if (!this.resetButtons || figuresList.length < parseInt(nBackSlider.value) || Math.random() > 0.25) {
                const newFigure = { x, y, ...shapeSystem.generateRandomShape(figuresList) };
                figuresList.push(newFigure);
                displayGameGrid([newFigure]);
                if (figuresList.length > parseInt(nBackSlider.value)) {
                    figuresList.shift();
                }
                this.resetButtons = true;
            } else {
                const oldFigure = figuresList[0];
                this.correctSelectAnswers = [];
                let currentFigures = [];
                for (let i = 0; i < gridSize; i++) {
                    for (let j = 0; j < gridSize; j++) {
                        const figure = {
                            x: i,
                            y: j,
                            ...shapeSystem.generateRandomShape()
                        };
                        currentFigures.push(figure);
                
                        if ((figure.x === oldFigure.x && figure.y === oldFigure.y) ||
                            figure.color === oldFigure.color ||
                            shapeSystem.isEqual(figure.shape, oldFigure.shape)) {
                            this.correctSelectAnswers.push({ i, j });
                        }
                    }
                }
                displayGameGrid(currentFigures);
                btnSelectSubmit.classList.remove("is-disabled");
                btnSelectSubmit.classList.add("is-primary");
                document.documentElement.style.setProperty('--grid-border-color', 'goldenrod');
                document.documentElement.style.setProperty('--grid-border-width', "3px");
                return;
            }
        }

        this.pausedInterval = (new Date()).getTime();
        this.gameInterval = setTimeout(() => this.gameLoop(), timeInterval);
    }

    pause(cond = "") {
        if (this.gameState === "running" && this.gameState != cond) {
            this.gameState = "paused";
            document.getElementById("pauseOverlay").style.display = "flex";
            document.getElementById("backdrop").style.display = "block";
            this.pausedInterval = this.pausedInterval + parseFloat(timeIntervalSlider.value) * 1000 - (new Date()).getTime();
            clearTimeout(this.gameInterval);
            console.log("> Pause")
        } else if (this.gameState === "paused" && this.gameState != cond) {
            this.gameState = "running";
            document.getElementById("pauseOverlay").style.display = "none";
            document.getElementById("backdrop").style.display = "none";
            console.log("> Resume")
            if (this.correctReverseAnswer > 0 && this.gameMode === "reverse") return;
            this.gameInterval = setTimeout(() => this.gameLoop(), this.pausedInterval);
            this.pausedInterval = (new Date()).getTime() - parseFloat(timeIntervalSlider.value) * 1000 + this.pausedInterval;
        }
    }

    stop() {
        this.gameState = "stopped";
        clearTimeout(this.gameInterval);
        this.breakStreak();
        this.gameMode = null;
        console.log("> Stop")
        document.getElementById("startPrompt").style.display = "none";
        document.getElementById("pauseOverlay").style.display = "none";
        document.getElementById("backdrop").style.display = "none";
    }

    getHighScore(gamemode, nback, gridSize, innerGridSize, timeInterval) {
        if (this.highScores[gamemode] &&
            this.highScores[gamemode][nback] &&
            this.highScores[gamemode][nback][gridSize] &&
            this.highScores[gamemode][nback][gridSize][innerGridSize]) {
            return this.highScores[gamemode][nback][gridSize][innerGridSize][timeInterval] || 0;
        }
        return 0;
    }

    breakStreak() {
        if (this.streak > 0) {
            const gameMode = this.gameMode;
            const nBack = nBackSlider.value;
            const gridSize = gridSizeSlider.value;
            const innerGridSize = innerGridSizeSlider.value;
            const timeInterval = timeIntervalSlider.value;
            
            this.highScores[gameMode] = this.highScores[gameMode] || {};
            this.highScores[gameMode][nBack] = this.highScores[gameMode][nBack] || {};
            this.highScores[gameMode][nBack][gridSize] = this.highScores[gameMode][nBack][gridSize] || {};
            this.highScores[gameMode][nBack][gridSize][innerGridSize] = this.highScores[gameMode][nBack][gridSize][innerGridSize] || {};

            if (this.streak > this.getHighScore(gameMode, nBack, gridSize, innerGridSize, timeInterval)) {
                this.highScores[gameMode][nBack][gridSize][innerGridSize][timeInterval] = this.streak;
                this.currentHighScore = this.streak;
                document.getElementById("highScore").innerText = this.currentHighScore;
                localStorage.setItem('nBackHighScores', JSON.stringify(this.highScores));
            }
            this.streak = 0;
            document.getElementById("currentScore").innerText = this.streak;
        }
    }
}

const game = new Game();


















function showGameModes() {
    if (screenTimeouts.gameModes) {
        clearTimeout(screenTimeouts.gameModes);
    }

    mainMenu.classList.remove('active');
    screenTimeouts.mainMenu = setTimeout(() => {
        mainMenu.style.display = 'none';
    }, screenTransitionDuration);

    gameScreen.classList.remove('active');
    screenTimeouts.gameScreen = setTimeout(() => {
        gameScreen.style.display = 'none';
    }, screenTransitionDuration);

    gameModes.style.display = '';
    gameModes.classList.add('active');

    game.stop();
    document.getElementById("scores").style.display = "none";
    document.getElementById("startPrompt").style.display = "none";
    document.getElementById("backdrop").style.display = "none";

    previousScreen = "mainMenu";
}

function startGame(mode='') {
    if (screenTimeouts.gameScreen) {
        clearTimeout(screenTimeouts.gameScreen);
    }
    
    gameModes.classList.remove('active');
    screenTimeouts.gameModes = setTimeout(() => {
        gameModes.style.display = 'none';
    }, screenTransitionDuration);

    gameScreen.style.display = '';
    gameScreen.classList.add('active');

    let gridSize = parseInt(gridSizeSlider.value);
    figuresList = [];
    compareModeButtons.style.display = mode === 'compare' ? '' : 'none';
    drawModeButtons.style.display = mode === 'draw' ? '' : 'none';
    reverseModeButtons.style.display = mode === 'reverse' ? 'flex' : 'none';
    selectModeButtons.style.display = mode === 'select' ? '' : 'none';
    document.getElementById("startPrompt").style.display = "flex";
    document.getElementById("backdrop").style.display = "block";
    gameGrid.style.width = '';
    displayGameGrid(gridSize);

    document.documentElement.style.setProperty('--grid-border-color', 'white');
    document.documentElement.style.setProperty('--grid-border-width', "2px");

    previousScreen = "gameModes";
}

function startCompareMode() {
    Array.from(compareModeButtons.children).forEach((btn) => {
        btn.classList.remove('is-success');
        btn.classList.remove('is-error');
        btn.classList.add('is-disabled');
    });
    startGame("compare");
    game.gameMode = "compare";
}

function startDrawMode() {
    Array.from(drawModeButtons.children).forEach((btn) => {
        btn.classList.remove('is-success');
        btn.classList.remove('is-error');
        btn.classList.add('is-disabled');
    });
    startGame("draw");
    game.gameMode = "draw";
}

function startReverseMode() {
    Array.from(reverseModeButtons.children).forEach((btn) => {
        btn.classList.remove('is-success');
        btn.classList.remove('is-error');
        btn.classList.add('is-disabled');
    });
    document.getElementById('sliderReverseNBack').max = parseInt(nBackSlider.value);
    document.getElementById('sliderReverseNBackValue').max = parseInt(nBackSlider.value);
    startGame("reverse");
    game.correctReverseAnswer = 0;
    game.gameMode = "reverse";
}

function startSelectAllMode() {
    Array.from(selectModeButtons.children).forEach((btn) => {
        btn.classList.remove('is-success');
        btn.classList.remove('is-error');
        btn.classList.add('is-disabled');
    });
    startGame("select");
    game.gameMode = "select";
}

function showSettings() {
    if (screenTimeouts.settingsScreen) {
        clearTimeout(screenTimeouts.settingsScreen);
    }

    screenTimeouts.mainMenu = setTimeout(() => {
        mainMenu.style.display = 'none';
    }, screenTransitionDuration);

    mainMenu.classList.remove('active');
    settingsScreen.style.display = '';
    settingsScreen.classList.add('active');

    previousScreen = "mainMenu";
}

function toggleShape() {
    if (!btnCompareShape.classList.contains('is-disabled')) {
        btnCompareShape.classList.toggle('is-error');
        btnCompareShape.classList.toggle('is-success');
    }
}

function togglePosition() {
    if (!btnComparePosition.classList.contains('is-disabled')) {
        btnComparePosition.classList.toggle('is-error');
        btnComparePosition.classList.toggle('is-success');
    }
}

function toggleColor() {
    if (!btnCompareColor.classList.contains('is-disabled')) {
        btnCompareColor.classList.toggle('is-error');
        btnCompareColor.classList.toggle('is-success');
    }
}

function reverseSubmit() {
    if (game.correctReverseAnswer < 1) return;
    const userGuess = parseInt(document.getElementById('sliderReverseNBackValue').value);

    btnReverseSubmit.classList.remove("is-primary");
    btnReverseSubmit.classList.add("is-disabled");
    game.resetButtons = false;
    if (userGuess === game.correctReverseAnswer) {
        btnReverseSubmit.classList.remove('is-error');
        btnReverseSubmit.classList.add('is-success');
        game.streak++;
        console.log("Correct", game.streak)
    } else {
        btnReverseSubmit.classList.remove('is-success');
        btnReverseSubmit.classList.add('is-error');
        game.breakStreak();
        console.log("Incorrect:", userGuess, game.correctReverseAnswer)
    }
    game.correctReverseAnswer = 0;
    document.getElementById("currentScore").innerText = game.streak;
    game.gameLoop();
}

function selectSubmit() {
    if (game.correctReverseAnswer < 1) return;
    const userGuess = parseInt(document.getElementById('sliderReverseNBackValue').value);

    btnReverseSubmit.classList.remove("is-primary");
    btnReverseSubmit.classList.add("is-disabled");
    
    if (userGuess === game.correctReverseAnswer) {
        btnReverseSubmit.classList.remove('is-error');
        btnReverseSubmit.classList.add('is-success');
        game.streak++;
        console.log("Correct", game.streak)
    } else {
        btnReverseSubmit.classList.remove('is-success');
        btnReverseSubmit.classList.add('is-error');
        game.breakStreak();
        console.log("Incorrect:", userGuess, game.correctReverseAnswer)
    }
    game.correctReverseAnswer = 0;
    document.getElementById("currentScore").innerText = game.streak;
    game.gameLoop();
}

function selectSubmit() {
    const selectedCells = document.querySelectorAll('.gridCell.selected');
    let correctGuesses = 0;
    let selectedPositions = [];
    game.resetButtons = false;
    selectedCells.forEach(cell => {
        const i = parseInt(cell.dataset.x);
        const j = parseInt(cell.dataset.y);
        selectedPositions.push({ i, j });
        const isSelectedCorrect = game.correctSelectAnswers.some(ans => ans.i === i && ans.j === j);

        if (isSelectedCorrect) {
            correctGuesses++;
        }
    });
    if (correctGuesses === game.correctSelectAnswers.length && correctGuesses === selectedCells.length) {
        btnSelectSubmit.classList.remove('is-error');
        btnSelectSubmit.classList.add('is-success');
        game.streak++;
        console.log("Correct", game.streak)
    } else {
        btnSelectSubmit.classList.remove('is-success');
        btnSelectSubmit.classList.add('is-error');
        game.breakStreak();
        console.log("Incorrect:", selectedPositions, game.correctSelectAnswers)
    }
    game.correctSelectAnswers = [];
    document.getElementById("currentScore").innerText = game.streak;
    game.gameLoop();
}


















function exitGame() {
    document.getElementById('exit-game-dialog').showModal();
    game.pause("paused");
}

function goBack() {
    if (!previousScreen) return;

    if (previousScreen === "mainMenu") {
        if (screenTimeouts.mainMenu) {
            clearTimeout(screenTimeouts.mainMenu);
        }

        gameModes.classList.remove('active');
        screenTimeouts.gameModes = setTimeout(() => {
            gameModes.style.display = 'none';
        }, screenTransitionDuration);
        
        settingsScreen.classList.remove('active');
        screenTimeouts.settingsScreen = setTimeout(() => {
            settingsScreen.style.display = 'none';
        }, screenTransitionDuration);
        
        mainMenu.style.display = '';
        mainMenu.classList.add('active');
    } else if (previousScreen === "gameModes") {
        game.pause();
    }
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        if (previousScreen !== "gameModes") {
            goBack();
        } else {
            game.pause();
        }
    } else if (event.key === "s") {
        toggleShape();
    } else if (event.key === "p") {
        togglePosition();
    } else if (event.key === "c") {
        toggleColor();
    }
});

document.addEventListener("DOMContentLoaded", function() {
    loadSettingsFromLocalStorage();

    // Add event listener for sliders
    let sliders = document.querySelectorAll('input[type="range"]');
    sliders.forEach(slider => {
        slider.addEventListener('input', function() {
            let numberInput = this.parentNode.querySelector('.sliderValue');
            if (numberInput) {
                numberInput.value = this.value;
            }
            saveSettingsToLocalStorage();
        });
    });

    // Add event listener for number inputs
    let numberInputs = document.querySelectorAll('.sliderValue');
    numberInputs.forEach(numberInput => {
        numberInput.addEventListener('input', function() {
            if (this.value)  {
                // Validate the input
                let minValue = parseInt(this.min);
                let maxValue = parseInt(this.max);
                let value = parseInt(this.value);

                if (value > maxValue) {
                    this.value = maxValue;
                } else if (value < minValue) {
                    this.value = minValue;
                }

                // Synchronize with the slider
                let slider = this.parentNode.querySelector('input[type="range"]');
                slider.value = this.value;
            }
            saveSettingsToLocalStorage();
        });

        numberInput.addEventListener('blur', function() {
            if (!this.value || parseFloat(this.value) !== parseInt(this.value)) {
                let slider = this.parentNode.querySelector('input[type="range"]');
                this.value = slider.value;
            }
            saveSettingsToLocalStorage();
        });
    });

    let gameModeButtons = document.querySelectorAll('.gameModeBtn');
    let modeDescriptions = document.querySelectorAll('.modeDescription .nes-text');

    gameModeButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            let mode = this.getAttribute('data-mode');
            modeDescriptions.forEach(desc => {
                if (desc.classList.contains(mode)) {
                    desc.style.display = '';
                } else {
                    desc.style.display = 'none';
                }
            });
        });
        /*
        button.addEventListener('mouseleave', function() {
            let mode = this.getAttribute('data-mode');
            modeDescriptions.forEach(desc => {
                if (desc.classList.contains(mode)) {
                    desc.style.display = 'none';
                }
            });
        });
        */
    });
});

window.addEventListener("resize", function() {
    if (previousScreen === "gameModes") {
        gameGrid.style.width = `${gameGrid.clientHeight - 6}px`;
        displayGameGrid(lastFiguresDisplayed);
    }
});