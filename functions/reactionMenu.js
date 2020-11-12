'use strict';

const Eris = require('eris'),
    Map = require('collections/map'),
    ms = require('ms');



class ReactionMenu {
    constructor(client, channel, user, message, reactions, timeout) {
        this.client = client;
        this.channel = channel instanceof Eris.Channel ? channel : this.client.guilds.find(g => g.channels.get(channel))[0].channels.get(channel);
        this.user = typeof user === 'string' ? [user] : user;
        this.state = 'default';
        this.messageChanging = true;
        this.states = new Map();
        this.timeoutDur = timeout ? timeout : '1m';
        if (!msg.channel.permissionsOf(client.user.id).has('manageMessages')) {
            this.channel.createMessage('I\'m sorry, but I need the permission `MANAGE_MESSAGES` for this to work!');
            throw new Error('Missing permission manageMessages');
        }
        this.reactionHandlerInstance = this.reactionAddListener.bind(this);
        this.states.set('default', { message, reactions, emojis: new Map() });
        this.channel.createMessage(message).then(message => {
            this.message = message;
            this.client.on('messageReactionAdd', this.reactionHandlerInstance);
            console.log(this.client.rawListeners('messageReactionAdd').indexOf(this.reactionHandlerInstance));
            this.addReactions(this.message, this.states.get(this.state).reactions).then(() => {
                this.timeout = setTimeout(() => {
                    this.message.delete();
                    this.client.off('messageReactionAdd', this.reactionHandlerInstance);
                    this.message.channel.createMessage(`<@${this.user[0]}> menu timed-out due to inactivity!`).then(msg => {
                        setTimeout(() => msg.delete(), ms('5s'));
                    });
                }, ms(this.timeoutDur));
                this.messageChanging = false;
            });
        });
    }

    reactionAddListener(msg, emoji, userID) {
        if (msg.id === this.message.id && userID !== this.client.user.id) this.message.removeReaction(emoji.id ? `${emoji.name}:${emoji.id}` : emoji.name, userID).catch(() => { });
        if (msg.id === this.message.id && this.user.includes(userID) && !this.messageChanging) this.handleReaction(emoji, userID);
    }

    addReactions(message, reactions) {
        let index = 0;
        return new Promise((resolve, reject) => {
            function addReaction(reaction) {
                message.addReaction(reaction).then(() => {
                    if (reactions[++index] === undefined) resolve();
                    else addReaction(reactions[index]);
                }, reject);
            }
            addReaction(reactions[index]);
        });
    }

    handleReaction(emoji, userID) {
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            this.message.delete();
            this.client.off('messageReactionAdd', this.reactionHandlerInstance);
            this.message.channel.createMessage(`<@${this.user[0]}> menu timed-out due to inactivity!`).then(msg => {
                setTimeout(() => msg.delete(), ms('5s'));
            });
        }, ms(this.timeoutDur));
        if (!this.states.has(this.state)) throw new Error('State does not exist');
        if (this.states.get(this.state).emojis.has(emoji.id ? `${emoji.name}:${emoji.id}` : emoji.name)) this.states.get(this.state).emojis.get(emoji.id ? `${emoji.name}:${emoji.id}` : emoji.name)(this.message, userID);
    }

    addState(state, options) {
        if (!state) throw new Error('state is required');
        this.states.set(state, { message: options ? (typeof options.message === 'function' ? options.message() : options.message) : null, reactions: options ? options.reactions : [], emojis: options ? (options.emojis instanceof Map ? emojis : typeof options.emojis !== "undefined" ? new Map(emojis) : new Map()) : new Map() });
    }

    addEmoji(state, emoji, action) {
        if (!state) throw new Error('state is required');
        if (!this.states.has(state)) throw new Error(`State '${state}' does not exist`);
        this.states.get(state).emojis.set(typeof emoji === 'object' ? `${emoji.name}:${emoji.id}` : emoji, action);
        if (this.states.get(state).reactions.indexOf(typeof emoji === 'object' ? `${emoji.name}:${emoji.id}` : emoji) === -1) this.states.get(state).reactions.push(typeof emoji === 'object' ? `${emoji.name}:${emoji.id}` : emoji);
    }

    close() {
        clearTimeout(this.timeout);
        this.client.off('messageReactionAdd', this.reactionHandlerInstance);
        this.message.delete();
    }

    async setState(state) {
        if (!this.states.has(state)) throw new Error('State does not exist');
        this.messageChanging = true;
        this.state = state;
        await this.message.removeReactions();
        if (this.states.get(this.state).message) {
            await this.message.edit(this.states.get(this.state).message);
        }
        await this.addReactions(this.message, this.states.get(this.state).reactions);
        this.messageChanging = false;
    }

    addUser(userID) {
        if (!this.user.includes(userID)) this.user.push(userID);
        return;
    }

    removeUser(userID) {
        if (this.user.includes(userID)) this.user = this.user.filter(e => e !== userID);
        return;
    }

    removeState(state) {
        if (!this.states.has(state)) throw new Error('State does not exist');
        this.states.delete(state);
    }

    removeEmoji(state, emoji) {
        if (!this.states.has(state)) throw new Error('State does not exist');
        this.states.get(state).emojis.delete(typeof emoji === 'object' ? `${emoji.name}:${emoji.id}` : emoji);
    }
}

module.exports = ReactionMenu;