const CONTRACT_ADDRESS = "0x7c1f217A2B3eF6ee54bB816BBD80ffaB0358D41F";

const transformCharacterData = (characterData) => {
    return {
        name: characterData.name,
        imageURI: characterData.imageURI,
        hp: characterData.hp.toNumber(),
        maxHp: characterData.maxHp.toNumber(),
        attackDamage: characterData.attackDamage.toNumber(),
    };
};
export { CONTRACT_ADDRESS, transformCharacterData };