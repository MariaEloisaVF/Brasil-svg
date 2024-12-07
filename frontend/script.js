const estadoSelect = document.getElementById('estado');
const municipioSelect = document.getElementById('municipio');
const svgMap = document.getElementById('svg-map');

fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
    .then(res => res.json())
    .then(data => {
        console.log('Estados recebidos:', data);
        data.forEach(estado => {
            const option = document.createElement('option');
            option.value = estado.sigla;
            option.textContent = estado.nome;
            estadoSelect.appendChild(option);
        });
    })
    .catch(err => {
        console.error('Erro ao carregar estados:', err);
        alert('Erro ao carregar estados. Verifique sua conexão.');
    });

estadoSelect.addEventListener('change', () => {
    const estadoSigla = estadoSelect.value;
    municipioSelect.innerHTML = ''; 
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoSigla}/municipios`)
        .then(res => res.json())
        .then(data => {
            console.log(`Municípios de ${estadoSigla}:`, data);
            data.forEach(municipio => {
                const option = document.createElement('option');
                option.value = municipio.nome;
                option.textContent = municipio.nome;
                municipioSelect.appendChild(option);
            });
        })
        .catch(err => {
            console.error('Erro ao carregar municípios:', err);
            alert('Erro ao carregar municípios. Verifique sua conexão.');
        });
});

// Buscar SVG ao selecionar município
municipioSelect.addEventListener('change', () => {
    const estado = estadoSelect.options[estadoSelect.selectedIndex].text;
    const municipio = municipioSelect.value; 

    svgMap.innerHTML = '';

    fetch(`http://localhost:3000/svg/${encodeURIComponent(estado)}/${encodeURIComponent(municipio)}`)
        .then(res => {
            if (!res.ok) throw new Error('Erro ao buscar SVG');
            return res.json();
        })
        .then(data => {
            console.log('SVG recebido:', data);

            svgMap.setAttribute('viewBox', data.viewBox);

            const pathEstado = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            pathEstado.setAttribute('d', data.pathestado);
            pathEstado.setAttribute('fill', '#B7A3FF');

            const pathMunicipio = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            pathMunicipio.setAttribute('d', data.pathmunicipio);
            pathMunicipio.setAttribute('fill', '#08107D'); 

            svgMap.appendChild(pathEstado);
            svgMap.appendChild(pathMunicipio);
        })
        .catch(err => {
            console.error('Erro ao buscar o SVG:', err);
            alert('Erro ao buscar o mapa. Verifique sua conexão ou os dados selecionados.');
        });
});

