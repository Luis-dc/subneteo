function calcularSubneteo() {
    const ip = document.getElementById('ip').value;
    const prefijo = document.getElementById('prefix').value;
    const hosts = document.getElementById('hosts').value;

    /* Calculos de hosts solicitados */
    let m = 0;

    while((Math.pow(2,m) - 2) < hosts){
        m++;
    }

    /* Calculos para la mascara de subred actual */
    const mascarabinaria = Array(32).fill('0');
    for(let i = 0; i < prefijo; i ++){
        mascarabinaria[i] = '1';
    }
    
    const maskbinaria = mascarabinaria.join('');
    
    const mascaradecimal = [];
    for(let i = 0; i < 4; i++){
        const octeto = parseInt(maskbinaria.slice(i*8, (i+1)*8), 2);
        mascaradecimal.push(octeto);
    }

    /* Cálculo de la nueva máscara de subred */
    const newMaskBinaria = Array(32).fill('1'); // Inicialmente todos los bits encendidos
    for(let i = 32 - m; i < 32; i++) { // Apagar los últimos m bits
        newMaskBinaria[i] = '0';
    }
    
    const nuevaMaskBinariaStr = newMaskBinaria.join('');

    const nuevaMascaradecimal = [];
    for(let i = 0; i < 4; i++) {
        const octeto = parseInt(nuevaMaskBinariaStr.slice(i * 8, (i + 1) * 8), 2);
        nuevaMascaradecimal.push(octeto);
    }

    /* Calculo para el nuevo prefijo */
    const nuevoPrefijo = nuevaMaskBinariaStr.split('1').length -1;

    const networkAddress = ip;
    /* Primera ip utilizable */
    const firstUsableIPOctetos = networkAddress.split('.').map(Number);
    firstUsableIPOctetos[3] += 1; // Sumar 1 al último octeto para obtener la primera IP utilizable
    

    const hostEncontrados = Math.pow(2,m) -2;
    const maskdecimal = mascaradecimal.join('.'); 
    const newSubnetMask = nuevaMascaradecimal.join('.');
    const firstUsableIP = firstUsableIPOctetos.join('.');
    const lastUsableIP = "192.168.1.254"; 
    const broadcast = "192.168.1.255"; 

    const resultsTable = document.getElementById('results-table').querySelector('tbody');
    const procsTable = document.getElementById('procs-table').querySelector('tbody');

    // Crear una nueva fila con los resultados
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>${hosts}</td>
        <td>${hostEncontrados}</td>
        <td>${networkAddress}</td>
        <td>${prefijo}</td>
        <td>${maskdecimal}</td>
        <td>${newSubnetMask}</td>
        <td>${nuevoPrefijo}</td>
        <td>${firstUsableIP}</td>
        <td>${lastUsableIP}</td>
        <td>${broadcast}</td>
    `;
    // xd
    //document.getElementById("binario").textContent = maskbinaria;
    const procRow = document.createElement('tr');
    procRow.innerHTML = `
    <td>${m}</td>
    <td>${maskbinaria}</td>
    <td>${nuevaMaskBinariaStr}</td>
    `;
    // Agregar la nueva fila a la tabla
    resultsTable.appendChild(newRow);
    procsTable.appendChild(procRow);
}

function resetearFormulario() {
    document.getElementById('ip').value = '';
    document.getElementById('prefix').value = '';
    document.getElementById('hosts').value = '';
}
