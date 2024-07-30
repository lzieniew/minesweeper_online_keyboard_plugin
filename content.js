(function() {
    let currentX = 0;
    let currentY = 0;
    let maxX = 0;
    let maxY = 0;

    const marker = document.createElement('div');
    marker.style.position = 'absolute';
    marker.style.border = '2px solid red';
    marker.style.width = '24px';
    marker.style.height = '24px';
    marker.style.pointerEvents = 'none';

    function detectBoardSize() {
        const cells = document.querySelectorAll('div.cell');
        if (cells.length > 0) {
            maxX = Math.max(...Array.from(cells).map(cell => parseInt(cell.getAttribute('data-x'))));
            maxY = Math.max(...Array.from(cells).map(cell => parseInt(cell.getAttribute('data-y'))));
            console.log(`Board size detected: maxX=${maxX}, maxY=${maxY}`);
        } else {
            console.log("No cells found to determine board size.");
        }
    }

    function updateMarkerPosition() {
        const cell = document.querySelector(`div[data-x="${currentX}"][data-y="${currentY}"]`);
        if (cell) {
            const rect = cell.getBoundingClientRect();
            marker.style.left = `${rect.left + window.scrollX}px`;
            marker.style.top = `${rect.top + window.scrollY}px`;
            console.log(`Marker updated to position: (${currentX}, ${currentY})`);
        } else {
            console.log(`Cell at position: (${currentX}, ${currentY}) not found.`);
        }
    }

    function revealCell() {
        const cell = document.querySelector(`div[data-x="${currentX}"][data-y="${currentY}"]`);
        if (cell) {
            cell.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0 }));
            cell.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, button: 0 }));
            console.log(`Cell at position: (${currentX}, ${currentY}) revealed.`);
        } else {
            console.log(`Cell at position: (${currentX}, ${currentY}) not found for reveal.`);
        }
    }

    function chordCell() {
        const cell = document.querySelector(`div[data-x="${currentX}"][data-y="${currentY}"]`);
        if (cell && cell.classList.contains('hd_type')) {
            cell.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 1 }));
            cell.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, button: 1 }));
            console.log(`Chord triggered on cell at position: (${currentX}, ${currentY}).`);
        } else {
            console.log(`Cell at position: (${currentX}, ${currentY}) not found or not suitable for chording.`);
        }
    }

    function markMine() {
        const cell = document.querySelector(`div[data-x="${currentX}"][data-y="${currentY}"]`);
        if (cell && cell.classList.contains('hd_closed')) {
            console.log(`Attempting to mark cell at position: (${currentX}, ${currentY}) as mine.`);
            
            const mousedownEvent = new MouseEvent('mousedown', { bubbles: true, button: 2, buttons: 2 });
            const mouseupEvent = new MouseEvent('mouseup', { bubbles: true, button: 2, buttons: 2 });
            cell.dispatchEvent(mousedownEvent);
            console.log('Dispatched mousedown event:', mousedownEvent);
            cell.dispatchEvent(mouseupEvent);
            console.log('Dispatched mouseup event:', mouseupEvent);

            if (!cell.classList.contains('flagged')) {
                const contextMenuEvent = new MouseEvent('contextmenu', { bubbles: true, button: 2, buttons: 2 });
                cell.dispatchEvent(contextMenuEvent);
                console.log('Dispatched contextmenu event:', contextMenuEvent);
            }

            console.log(`Cell at position: (${currentX}, ${currentY}) marked as mine.`);
        } else {
            console.log(`Cell at position: (${currentX}, ${currentY}) not found or already revealed.`);
        }
    }

    function findNextTransition(startX, startY, direction) {
        let x = startX;
        let y = startY;
        const startCell = document.querySelector(`div[data-x="${x}"][data-y="${y}"]`);
        const startType = getCellType(startCell);
        
        while (x >= 0 && x <= maxX && y >= 0 && y <= maxY) {
            switch (direction) {
                case 'left': x--; break;
                case 'right': x++; break;
                case 'up': y--; break;
                case 'down': y++; break;
            }
            
            if (x < 0 || x > maxX || y < 0 || y > maxY) {
                switch (direction) {
                    case 'left': return { x: 0, y: startY };
                    case 'right': return { x: maxX, y: startY };
                    case 'up': return { x: startX, y: 0 };
                    case 'down': return { x: startX, y: maxY };
                }
            }
            
            const cell = document.querySelector(`div[data-x="${x}"][data-y="${y}"]`);
            if (!cell) continue;
            
            const cellType = getCellType(cell);
            if (cellType !== startType) {
                return { x, y };
            }
        }
        
        return { x: startX, y: startY };
    }

    function getCellType(cell) {
        if (cell.classList.contains('hd_closed')) return 'closed';
        if (cell.classList.contains('hd_type')) return 'revealed';
        if (cell.classList.contains('flagged')) return 'flagged';
        return 'unknown';
    }

    function handleKeydown(e) {
        console.log(`Key pressed: ${e.key}`);
        switch (e.key) {
            case 'ArrowUp':
            case 'k':
                e.preventDefault();
                currentY = Math.max(0, currentY - 1);
                break;
            case 'ArrowDown':
            case 'j':
                e.preventDefault();
                currentY = Math.min(maxY, currentY + 1);
                break;
            case 'ArrowLeft':
            case 'h':
                e.preventDefault();
                currentX = Math.max(0, currentX - 1);
                break;
            case 'ArrowRight':
            case 'l':
                e.preventDefault();
                currentX = Math.min(maxX, currentX + 1);
                break;
            case 'H':
                e.preventDefault();
                if (e.shiftKey) {
                    const { x } = findNextTransition(currentX, currentY, 'left');
                    currentX = x;
                } else {
                    currentX = 0;
                }
                break;
            case 'J':
                e.preventDefault();
                if (e.shiftKey) {
                    const { y } = findNextTransition(currentX, currentY, 'down');
                    currentY = y;
                } else {
                    currentY = maxY;
                }
                break;
            case 'K':
                e.preventDefault();
                if (e.shiftKey) {
                    const { y } = findNextTransition(currentX, currentY, 'up');
                    currentY = y;
                } else {
                    currentY = 0;
                }
                break;
            case 'L':
                e.preventDefault();
                if (e.shiftKey) {
                    const { x } = findNextTransition(currentX, currentY, 'right');
                    currentX = x;
                } else {
                    currentX = maxX;
                }
                break;
            case 'd':
                e.preventDefault();
                revealCell();
                break;
            case 'c':
                e.preventDefault();
                chordCell();
                break;
            case 'f':
                e.preventDefault();
                markMine();
                break;
        }
        detectBoardSize();
        updateMarkerPosition();
    }

    function handleKeyup(e) {
        console.log(`Key released: ${e.key}`);
        if (e.key === 'd' || e.key === 'f' || e.key === 'c' || e.key.startsWith('Arrow')) {
            e.preventDefault();
        }
    }

    function addEventListeners() {
        document.addEventListener('keydown', handleKeydown);
        document.addEventListener('keyup', handleKeyup);
    }

    function removeEventListeners() {
        document.removeEventListener('keydown', handleKeydown);
        document.removeEventListener('keyup', handleKeyup);
    }

    function initMinesweeperExtension() {
        if (!window.location.pathname.startsWith('/game/')) {
            console.log("Not a Minesweeper game page, deactivating extension.");
            marker.remove();
            removeEventListeners();
            return;
        }

        if (!document.body.contains(marker)) {
            document.body.appendChild(marker);
            console.log("Minesweeper game page detected, activating extension.");
        }

        addEventListeners();
        detectBoardSize();
        updateMarkerPosition();
        console.log("Initial marker position set.");
    }

    function handlePageNavigation() {
        if (window.location.pathname.startsWith('/game/')) {
            initMinesweeperExtension();
        } else {
            marker.remove();
            removeEventListeners();
        }
    }

    window.addEventListener('popstate', handlePageNavigation);
    window.addEventListener('pushstate', handlePageNavigation);
    window.addEventListener('replaceState', handlePageNavigation);
    window.addEventListener('DOMContentLoaded', handlePageNavigation);
    window.addEventListener('load', handlePageNavigation);

    initMinesweeperExtension();
})();
