self.addEventListener("message", (msg) => {
    if (msg.data.cmd === "setInterruptBuffer") {
        pyodide.setInterruptBuffer(msg.data.interruptBuffer);
        return;
    }
    if (msg.data.cmd === "runCode") {
        pyconsole.push(msg.data.code);
        return;
    }
});
