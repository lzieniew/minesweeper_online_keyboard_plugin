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
            console.log(`Cell at position: (${currentX}, ${currentY}) marked as mine.`);
        } else {
            console.log(`Cell at position: (${currentX}, ${currentY}) not found or already revealed.`);
        }
    }

    function handleKeydown(e) {
        console.log(`Key pressed: ${e.key}`);
        switch (e.key) {
            case 'ArrowUp':
            case 'k':
                e.preventDefault(); // Prevent default action for arrow keys
                currentY = Math.max(0, currentY - 1);
                break;
            case 'ArrowDown':
            case 'j':
                e.preventDefault(); // Prevent default action for arrow keys
                currentY = Math.min(maxY, currentY + 1);
                break;
            case 'ArrowLeft':
            case 'h':
                e.preventDefault(); // Prevent default action for arrow keys
                currentX = Math.max(0, currentX - 1);
                break;
            case 'ArrowRight':
            case 'l':
                e.preventDefault(); // Prevent default action for arrow keys
                currentX = Math.min(maxX, currentX + 1);
                break;
            case 'H':
                e.preventDefault(); // Prevent default action for H key
                currentX = 0; // Move to left edge
                break;
            case 'J':
                e.preventDefault(); // Prevent default action for J key
                currentY = maxY; // Move to bottom edge
                break;
            case 'K':
                e.preventDefault(); // Prevent default action for K key
                currentY = 0; // Move to top edge
                break;
            case 'L':
                e.preventDefault(); // Prevent default action for L key
                currentX = maxX; // Move to right edge
                break;
            case 'd':
                e.preventDefault(); // Prevent default action for d key
                revealCell();
                break;
            case 'c':
                e.preventDefault(); // Prevent default action for c key
                chordCell();
                break;
            case 'f':
                e.preventDefault(); // Prevent default action for f key
                markMine();
                break;
            // Do not prevent default action for spacebar
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

    // Handle page navigation to ensure extension is initialized only on game pages
    function handlePageNavigation() {
        if (window.location.pathname.startsWith('/game/')) {
            initMinesweeperExtension();
        } else {
            marker.remove();
            removeEventListeners();
        }
    }

    window.addEventListener('popstate', handlePageNavigation);
    window.addEventListener('pushstate', handlePageNavigation); // For SPAs that use pushState
    window.addEventListener('replaceState', handlePageNavigation); // For SPAs that use replaceState
    window.addEventListener('DOMContentLoaded', handlePageNavigation);
    window.addEventListener('load', handlePageNavigation);

    initMinesweeperExtension();
})();
