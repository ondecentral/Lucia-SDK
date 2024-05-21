// MurmurHash3 constants
const C1 = 0xcc9e2d51
const C2 = 0x1b873593
const C3 = 0xe6546b64
const C4 = 0x85ebca6b
const C5 = 0xc2b2ae35

// Helper functions to perform bitwise operations on 32-bit integers
function rotl32(x, r) {
    return (x << r) | (x >>> (32 - r))
}

function fmix32(h) {
    h ^= h >>> 16
    h = Math.imul(h, C4)
    h ^= h >>> 13
    h = Math.imul(h, C5)
    h ^= h >>> 16
    return h
}

// MurmurHash3 x86 32-bit hash function
function hash(key, seed = 0) {
    let h = seed
    let k = 0
    let remainder = key.length & 3 // key.length % 4
    let bytes = key.length - remainder
    let i = 0

    // Process key in 4-byte chunks
    while (i < bytes) {
        k =
            (key.charCodeAt(i) & 0xff) |
            ((key.charCodeAt(++i) & 0xff) << 8) |
            ((key.charCodeAt(++i) & 0xff) << 16) |
            ((key.charCodeAt(++i) & 0xff) << 24)
        ++i

        // Mix k into h
        k = Math.imul(k, C1)
        k = rotl32(k, 15)
        k = Math.imul(k, C2)
        h ^= k
        h = rotl32(h, 13)
        h = Math.imul(h, 5) + C3
    }

    // Process remaining bytes
    k = 0
    switch (remainder) {
        case 3:
            k ^= (key.charCodeAt(i + 2) & 0xff) << 16
        case 2:
            k ^= (key.charCodeAt(i + 1) & 0xff) << 8
        case 1:
            k ^= key.charCodeAt(i) & 0xff
            k = Math.imul(k, C1)
            k = rotl32(k, 15)
            k = Math.imul(k, C2)
            h ^= k
    }

    // Finalize and return
    h ^= key.length
    h = fmix32(h)
    const v = h >>> 0 // Convert to unsigned 32-bit integer
    return v.toString(36) // Conver to base-36 string
}

function getCommonPixels(images, width, height) {
    let finalData = []
    for (let i = 0; i < images[0].data.length; i++) {
        let indice = []
        for (let u = 0; u < images.length; u++) {
            indice.push(images[u].data[i])
        }
        finalData.push(getMostFrequent(indice))
    }

    const pixelData = finalData
    const pixelArray = new Uint8ClampedArray(pixelData)
    return new ImageData(pixelArray, width, height)
}

function getMostFrequent(arr) {
    if (arr.length === 0) {
        return 0 // Handle empty array case
    }

    const frequencyMap = {}

    // Count occurrences of each number in the array
    for (const num of arr) {
        frequencyMap[num] = (frequencyMap[num] || 0) + 1
    }

    let mostFrequent = arr[0]

    // Find the number with the highest frequency
    for (const num in frequencyMap) {
        if (frequencyMap[num] > frequencyMap[mostFrequent]) {
            mostFrequent = parseInt(num, 10)
        }
    }

    return mostFrequent
}
function getBrowser() {
    if (typeof navigator === "undefined") {
        return {
            name: "unknown",
            version: "unknown"
        }
    }
    const ua = navigator.userAgent
    // Define some regular expressions to match different browsers and their versions
    const regexes = [
        // Edge
        /(?<name>Edge|Edg)\/(?<version>\d+(?:\.\d+)?)/,
        // Chrome, Chromium, Opera, Vivaldi, Brave, etc.
        /(?<name>(?:Chrome|Chromium|OPR|Opera|Vivaldi|Brave))\/(?<version>\d+(?:\.\d+)?)/,
        // Firefox, Waterfox, etc.
        /(?<name>(?:Firefox|Waterfox|Iceweasel|IceCat))\/(?<version>\d+(?:\.\d+)?)/,
        // Safari, Mobile Safari, etc.
        /(?<name>Safari)\/(?<version>\d+(?:\.\d+)?)/,
        // Internet Explorer, IE Mobile, etc.
        /(?<name>MSIE|Trident|IEMobile).+?(?<version>\d+(?:\.\d+)?)/,
        // Other browsers that use the format "BrowserName/version"
        /(?<name>[A-Za-z]+)\/(?<version>\d+(?:\.\d+)?)/,
        // Samsung internet browser
        /(?<name>SamsungBrowser)\/(?<version>\d+(?:\.\d+)?)/
    ]

    // Define a map for browser name translations
    const browserNameMap = {
        Edg: "Edge",
        OPR: "Opera"
    }

    // Loop through the regexes and try to find a match
    for (const regex of regexes) {
        const match = ua.match(regex)
        if (match && match.groups) {
            // Translate the browser name if necessary
            const name = browserNameMap[match.groups.name] || match.groups.name
            // Return the browser name and version
            return {
                name: name,
                version: match.groups.version
            }
        }
    }

    // If no match is found, return unknown
    return {
        name: "unknown",
        version: "unknown"
    }
}

const _RUNS = getBrowser().name !== "SamsungBrowser" ? 1 : 3
let canvas
let gl = null

if (typeof document !== "undefined") {
    canvas = document.createElement("canvas")
    canvas.width = 200
    canvas.height = 100
    gl = canvas.getContext("webgl")
}

 export async function createWebGLFingerprint() {
    try {

        if (!gl) {
            throw new Error("WebGL not supported")
        }

        const imageDatas = Array.from({ length: _RUNS }, () =>
            createWebGLImageData()
        )
        // and then checking the most common bytes for each channel of each pixel
        const commonImageData = getCommonPixels(
            imageDatas,
            canvas.width,
            canvas.height
        )
        //const imageData = createWebGLImageData()

        return {
            commonImageHash: hash(commonImageData.data.toString()).toString()
        }
    } catch (error) {
        console.log(error)
        return {
            webgl: "unsupported"
        }
    }
}

setTimeout(async ()=>{
    let xyz =  await createWebGLFingerprint();
    console.log(xyz,"webgl")
},1000)

function createWebGLImageData() {
    try {
        if (!gl) {
            throw new Error("WebGL not supported")
        }

        const vertexShaderSource = `
          attribute vec2 position;
          void main() {
              gl_Position = vec4(position, 0.0, 1.0);
          }
      `

        const fragmentShaderSource = `
          precision mediump float;
          void main() {
              gl_FragColor = vec4(0.812, 0.195, 0.553, 0.921); // Set line color
          }
      `

        const vertexShader = gl.createShader(gl.VERTEX_SHADER)
        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)

        if (!vertexShader || !fragmentShader) {
            throw new Error("Failed to create shaders")
        }

        gl.shaderSource(vertexShader, vertexShaderSource)
        gl.shaderSource(fragmentShader, fragmentShaderSource)

        gl.compileShader(vertexShader)
        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
            throw new Error(
                "Vertex shader compilation failed: " + gl.getShaderInfoLog(vertexShader)
            )
        }

        gl.compileShader(fragmentShader)
        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
            throw new Error(
                "Fragment shader compilation failed: " +
                gl.getShaderInfoLog(fragmentShader)
            )
        }

        const shaderProgram = gl.createProgram()

        if (!shaderProgram) {
            throw new Error("Failed to create shader program")
        }

        gl.attachShader(shaderProgram, vertexShader)
        gl.attachShader(shaderProgram, fragmentShader)
        gl.linkProgram(shaderProgram)
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            throw new Error(
                "Shader program linking failed: " + gl.getProgramInfoLog(shaderProgram)
            )
        }

        gl.useProgram(shaderProgram)

        // Set up vertices to form lines
        const numSpokes = 137
        const vertices = new Float32Array(numSpokes * 4)
        const angleIncrement = (2 * Math.PI) / numSpokes

        for (let i = 0; i < numSpokes; i++) {
            const angle = i * angleIncrement

            // Define two points for each line (spoke)
            vertices[i * 4] = 0 // Center X
            vertices[i * 4 + 1] = 0 // Center Y
            vertices[i * 4 + 2] = Math.cos(angle) * (canvas.width / 2) // Endpoint X
            vertices[i * 4 + 3] = Math.sin(angle) * (canvas.height / 2) // Endpoint Y
        }

        const vertexBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

        const positionAttribute = gl.getAttribLocation(shaderProgram, "position")
        gl.enableVertexAttribArray(positionAttribute)
        gl.vertexAttribPointer(positionAttribute, 2, gl.FLOAT, false, 0, 0)

        // Render
        gl.viewport(0, 0, canvas.width, canvas.height)
        gl.clearColor(0.0, 0.0, 0.0, 1.0)
        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.drawArrays(gl.LINES, 0, numSpokes * 2)

        const pixelData = new Uint8ClampedArray(canvas.width * canvas.height * 4)
        gl.readPixels(
            0,
            0,
            canvas.width,
            canvas.height,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            pixelData
        )
        const imageData = new ImageData(pixelData, canvas.width, canvas.height)

        return imageData
    } catch (error) {
        //console.error(error);
        return new ImageData(1, 1)
    } finally {
        if (gl) {
            // Reset WebGL state
            gl.bindBuffer(gl.ARRAY_BUFFER, null)
            gl.useProgram(null)
            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
            gl.clearColor(0.0, 0.0, 0.0, 0.0)
        }
    }
}



