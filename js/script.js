let vlsmNetworks = [];

function ipToInt(ip) {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0);
}
function intToIp(int) {
    return [
        (int >>> 24) & 255,
        (int >>> 16) & 255,
        (int >>> 8) & 255,
        int & 255
    ].join('.');
}


function definirSubnets() {
    const numSubnets = document.getElementById('numSubnets').value;

    const subnetsContainer = document.createElement('div');
    subnetsContainer.id = 'subnetsContainer';
    subnetsContainer.innerHTML = '';

    for (let i = 0; i < numSubnets; i++) {
        const subnetDiv = document.createElement('div');
        subnetDiv.className = 'subnet';
        subnetDiv.innerHTML = `
            <h3>Subnet ${i + 1}</h3>
            <label for="hosts${i}">Cantidad de Hosts:</label>
            <input type="number" id="hosts${i}" placeholder="Ej: 50" min="1">
            <label for="links${i}">Cantidad de Enlaces:</label>
            <input type="number" id="links${i}" placeholder="Ej: 2" min="0">
        `;
        subnetsContainer.appendChild(subnetDiv);
    }

    const calcularButton = document.createElement('button');
    calcularButton.innerText = 'Calcular Subneteo';
    calcularButton.onclick = () => calcularSubneteo(numSubnets);
    subnetsContainer.appendChild(calcularButton);

    // Botón para calcular enlaces por separado
    const calcularEnlacesButton = document.createElement('button');
    calcularEnlacesButton.innerText = 'Calcular VLSM para Enlaces';
    calcularEnlacesButton.onclick = calcularEnlaces;
    subnetsContainer.appendChild(calcularEnlacesButton);

    document.querySelector('.container').appendChild(subnetsContainer);
}

let lastNetworkAddress = "";
let lastPrefix = 0;

function calcularSubneteo(numSubnets) {
    let currentNetworkAddress = document.getElementById('ip').value;
    let prefijo = parseInt(document.getElementById('prefix').value, 10);

    document.getElementById('results-table').querySelector('tbody').innerHTML = '';
    document.getElementById('procs-table').querySelector('tbody').innerHTML = '';

    let vlsmNetworks = []; // Para guardar las redes de VLSM

    for (let i = 0; i < numSubnets; i++) {
        const hosts = parseInt(document.getElementById(`hosts${i}`).value, 10);

        let m = 0;
        while ((Math.pow(2, m) - 2) < hosts) m++;

        const nuevoPrefijo = 32 - m;
        const newMaskBinaria = '1'.repeat(nuevoPrefijo) + '0'.repeat(32 - nuevoPrefijo);

        const nuevaMascaradecimal = [];
        for (let j = 0; j < 4; j++) {
            const octeto = parseInt(newMaskBinaria.slice(j * 8, (j + 1) * 8), 2);
            nuevaMascaradecimal.push(octeto);
        }

        const newSubnetMask = nuevaMascaradecimal.join('.');

        const blockSize = Math.pow(2, 32 - nuevoPrefijo);
        const networkInt = ipToInt(currentNetworkAddress);
        const broadcastInt = networkInt + blockSize - 1;
        const firstUsableInt = networkInt + 1;
        const lastUsableInt = broadcastInt - 1;

        const hostEncontrados = Math.pow(2, m) - 2;

        const firstUsableIP = intToIp(firstUsableInt);
        const lastUsableIP = intToIp(lastUsableInt);
        const broadcast = intToIp(broadcastInt);

        const resultsTable = document.getElementById('results-table').querySelector('tbody');
        const procsTable = document.getElementById('procs-table').querySelector('tbody');

        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${hosts}</td>
            <td>${hostEncontrados}</td>
            <td>${currentNetworkAddress}</td>
            <td>/${prefijo}</td>
            <td>${newSubnetMask}</td>
            <td>${newSubnetMask}</td>
            <td>/${nuevoPrefijo}</td>
            <td>${firstUsableIP}</td>
            <td>${lastUsableIP}</td>
            <td>${broadcast}</td>
        `;
        resultsTable.appendChild(newRow);

        const procRow = document.createElement('tr');
        procRow.innerHTML = `
            <td>${m}</td>
            <td>${newMaskBinaria}</td>
            <td>${newMaskBinaria}</td>
        `;
        procsTable.appendChild(procRow);

        // Guardar la red de VLSM
        vlsmNetworks.push({ address: currentNetworkAddress, prefix: nuevoPrefijo });

        // Preparar para la siguiente subred
        currentNetworkAddress = intToIp(broadcastInt + 1);
        prefijo = nuevoPrefijo;
    }

    // Guardar la última dirección de red y prefijo para calcular los enlaces
    lastNetworkAddress = currentNetworkAddress;
    lastPrefix = prefijo;

    // Mostrar VLSM para FLSM
    mostrarVLSM(vlsmNetworks);
}

function mostrarVLSM(vlsmNetworks) {
    const vlsmContainer = document.getElementById('vlsm-subnets');
    vlsmContainer.innerHTML = ''; // Limpiar el contenedor

    vlsmNetworks.forEach((network, index) => {
        const subnetDiv = document.createElement('div');
        subnetDiv.className = 'vlsm-subnet';
        subnetDiv.innerHTML = `
            <label for="subnet${index}">Dirección de Red ${index + 1}:</label>
            <input type="text" id="subnet${index}" value="${network.address}/${network.prefix}" readonly>
        `;
        vlsmContainer.appendChild(subnetDiv);
    });
}


function calcularEnlaces() {
    const numSubnets = document.getElementById('numSubnets').value;
    let currentNetworkAddress = lastNetworkAddress;
    let prefijo = lastPrefix;

    const enlacesTable = document.getElementById('enlaces-table').querySelector('tbody');
    enlacesTable.innerHTML = ''; // Limpiar la tabla de enlaces

    for (let i = 0; i < numSubnets; i++) {
        const links = parseInt(document.getElementById(`links${i}`).value, 10);

        let mEnlaces = 0;
        while ((Math.pow(2, mEnlaces) - 2) < links) mEnlaces++;

        const nuevoPrefijo = 32 - mEnlaces;

        const newMaskBinaria = '1'.repeat(nuevoPrefijo) + '0'.repeat(32 - nuevoPrefijo);

        const nuevaMascaradecimal = [];
        for (let j = 0; j < 4; j++) {
            const octeto = parseInt(newMaskBinaria.slice(j * 8, (j + 1) * 8), 2);
            nuevaMascaradecimal.push(octeto);
        }

        const newSubnetMask = nuevaMascaradecimal.join('.');

        // Tamaño del bloque
        const blockSize = Math.pow(2, 32 - nuevoPrefijo);

        const networkInt = ipToInt(currentNetworkAddress);
        const broadcastInt = networkInt + blockSize - 1;
        const firstUsableInt = networkInt + 1;
        const lastUsableInt = broadcastInt - 1;

        const firstUsableIP = intToIp(firstUsableInt);
        const lastUsableIP = intToIp(lastUsableInt);
        const broadcast = intToIp(broadcastInt);

        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${links}</td>
            <td>${currentNetworkAddress}</td>
            <td>/${prefijo}</td>
            <td>${newSubnetMask}</td>
            <td>${firstUsableIP}</td>
            <td>${lastUsableIP}</td>
            <td>${broadcast}</td>
        `;
        enlacesTable.appendChild(newRow);

        // Actualizar la dirección de red para el siguiente enlace
        currentNetworkAddress = intToIp(broadcastInt + 1);
        prefijo = nuevoPrefijo;
    }
}


function nextNetworkAddress(currentNetworkAddress, newSubnetMask) {
    const maskArray = newSubnetMask.split('.').map(Number);
    const octetoModificado = maskArray.find(octeto => octeto < 255);
    const salto = 256 - octetoModificado;
    const ipArray = currentNetworkAddress.split('.').map(Number);

    ipArray[3] = 0; // Reiniciar último octeto para nueva subred
    ipArray[2] += salto;

    return ipArray.join('.');
}


function calcularFLSM() {
    const ip = document.getElementById('dire').value;
    const prefix = parseInt(document.getElementById('prefix2').value);
    const numSubnets = parseInt(document.getElementById('numSubnets2').value);

    if (!ip || isNaN(prefix) || isNaN(numSubnets) || prefix < 0 || prefix > 32 || numSubnets < 1) {
        alert("Por favor, ingrese valores válidos.");
        return;
    }

    const resultsTable = document.getElementById('flsm-table').getElementsByTagName('tbody')[0];
    resultsTable.innerHTML = ""; // Limpiar tabla antes de mostrar nuevos resultados

    // Calculo de bits extra necesarios para las subredes
    const bitsSubnets = Math.ceil(Math.log2(numSubnets));
    const newPrefix = prefix + bitsSubnets;

    const subnetSize = Math.pow(2, 32 - newPrefix);
    const hostsPerSubnet = subnetSize - 2; // -2 para red y broadcast

    // Función para convertir IP a número entero
    function ipToInt(ip) {
        return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0);
    }

    // Función para convertir número entero a IP
    function intToIp(int) {
        return [
            (int >>> 24) & 255,
            (int >>> 16) & 255,
            (int >>> 8) & 255,
            int & 255
        ].join('.');
    }

    let networkInt = ipToInt(ip);
    let subnetCounter = 1;

    for (let i = 0; i < numSubnets; i++) {
        // Calcular la primera IP utilizable
        const startIPInt = networkInt + 1; // Primera IP utilizable

        // Calcular la última IP utilizable y el broadcast
        const endIPInt = networkInt + subnetSize - 2; // Última IP utilizable
        const broadcastInt = networkInt + subnetSize - 1; // IP de broadcast

        // Convertir IPs a formato de cadena
        const startIP = intToIp(startIPInt);
        const endIP = intToIp(endIPInt);
        const broadcast = intToIp(broadcastInt);

        // Nueva máscara de subred en formato binario
        const newMaskBinaria = '1'.repeat(newPrefix) + '0'.repeat(32 - newPrefix);
        const nuevaMascaradecimal = [];
        for (let j = 0; j < 4; j++) {
            const octeto = parseInt(newMaskBinaria.slice(j * 8, (j + 1) * 8), 2);
            nuevaMascaradecimal.push(octeto);
        }
        const newSubnetMask = nuevaMascaradecimal.join('.');

        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>Subred ${subnetCounter}</td>
            <td>${startIP}</td>
            <td>${endIP}</td>
            <td>${broadcast}</td>
            <td>${newSubnetMask}</td>
            <td>${hostsPerSubnet}</td>
        `;
        resultsTable.appendChild(newRow);

        // Actualizar la dirección de red para la siguiente subred
        networkInt = broadcastInt + 1;

        subnetCounter++;
    }
}


function resetearFormulario() {
    document.getElementById('ip').value = '';
    document.getElementById('prefix').value = '';
    document.getElementById('numSubnets').value = '';

    const subnetsContainer = document.getElementById('subnetsContainer');
    if (subnetsContainer) {
        subnetsContainer.remove();
    }

    // Limpiar las tablas de resultados
    document.getElementById('results-table').querySelector('tbody').innerHTML = '';
    document.getElementById('procs-table').querySelector('tbody').innerHTML = '';
}



function resetearFormulario() {
    document.getElementById('ip').value = '';
    document.getElementById('prefix').value = '';
    document.getElementById('numSubnets').value = '';
    
    const subnetsContainer = document.getElementById('subnetsContainer');
    if (subnetsContainer) {
        subnetsContainer.remove();
    }

    // Limpiar las tablas de resultados
    document.getElementById('results-table').querySelector('tbody').innerHTML = '';
    document.getElementById('procs-table').querySelector('tbody').innerHTML = '';
}

function resetearFormulario2(){
    document.getElementById('dire').value = '';
    document.getElementById('prefix2').value = '';
    document.getElementById('numSubnets2').value = '';
}
