document.getElementById('search-button').addEventListener('click', function() {
    const query = document.getElementById('search-input').value;
    if (query.trim() === '') return;

    // Simulate a search operation
    // In a real application, you would make an AJAX request here
    const results = [
        { id: 1, name: 'John Doe', skill: 'JavaScript'},
        { id: 2, name: 'Jane Smith', skill: 'Python'},
        // Add more results as needed
    ];

    displayResults(results);
});

function displayResults(results) {
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = '';

    results.forEach(result => {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item p-4';
        resultItem.innerHTML = `
            <h4>${result.name}</h4>
            <p><strong>Skill:</strong> ${result.skill}</p>

        `;

        resultItem.addEventListener('click', function() {
            document.getElementById('recipient-id').value = result.id;
            document.getElementById('message-form').classList.remove('hidden');
        });

        resultsContainer.appendChild(resultItem);
    });
}

document.getElementById('message-form-content').addEventListener('submit', function(e) {
    e.preventDefault();

    const recipientId = document.getElementById('recipient-id').value;
    const messageText = document.getElementById('message-text').value;

    if (recipientId && messageText.trim() !== '') {
        // Simulate sending a message
        // In a real application, you would send an AJAX request here
        alert('Message sent successfully!');

        // Clear the form and hide it
        document.getElementById('message-form-content').reset();
        document.getElementById('message-form').classList.add('hidden');
    }
});
