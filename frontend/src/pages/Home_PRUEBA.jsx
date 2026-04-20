import React from 'react';

function Home() {
    return (
        <div style={{
            background: 'linear-gradient(45deg, #ff0000, #00ff00, #0000ff)',
            padding: '50px',
            textAlign: 'center',
            color: 'white',
            fontSize: '24px',
            fontWeight: 'bold'
        }}>
            <h1>PRUEBA VISUAL - ESTE COLOR DEBE SER VISIBLE</h1>
            <p>Si ves esto, React está funcionando</p>
            <p>Background: Gradiente Rojo-Verde-Azul</p>
            <p>Texto: Blanco y grande</p>
            <div style={{
                background: 'yellow',
                color: 'black',
                padding: '20px',
                margin: '20px',
                borderRadius: '10px'
            }}>
                ESTE CAJA AMARILLA DEBE SER IMPOSIBLE DE IGNORAR
            </div>
        </div>
    );
}

export default Home;
