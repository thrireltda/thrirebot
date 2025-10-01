export default class
{
    static #_DEFAULT = 0;
    static #_MUSIC = 1;
    static #_RADIO = 2;
    static #_ESPEAK = 3;

    static get DEFAULT() { return this.#_DEFAULT; }
    static get MUSIC() { return this.#_MUSIC; }
    static get RADIO() { return this.#_RADIO; }
    static get ESPEAK() { return this.#_ESPEAK; }
}