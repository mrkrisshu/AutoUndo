import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const AutoUndoModule = buildModule("AutoUndoModule", (m) => {
    const autoUndoStorage = m.contract("AutoUndoStorage");
    return { autoUndoStorage };
});

export default AutoUndoModule;
