export default class ActorHitdice {
    constructor() {
        this.counter = {};
        this._rollTableList = {};
        this.dict = null;
        this.initHooks();
    }

    initHooks() {
        this.registerSettings();
        this.loadSettings();

        Hooks.on('ready', async () => {
            if (!game.user.isGM)
                return;

            Hooks.on('preCreateToken', (scene, data, options, userId) => {
                this._setTokenData(scene, data);
            })
        });
    }

    /**
     * 
     * @param {*} scene 
     * @param {*} data TokenData
     */
    _setTokenData(scene, data) {
        const actor = game.actors.get(data.actorId);

        if (!actor || (data.actorLink && this.data.unlinkedOnly)) // Don't for linked token
            return data;

        // Do this for all tokens, even player created ones        
         this._rollHP(data, actor);

        return data;
    }


    _rollHP(data, actor) {
        const actorHitdiceEnabled = actor.data.data.attributes[this.attr_enabler];
        const hitdice = actor.data.data.attributes[this.attr_hitdice];

        if (actorHitdiceEnabled != undefined &&
            actorHitdiceEnabled.value == true &&
            hitdice != undefined) {
            const r = new Roll(hitdice.value.replace(" ", ""));
            r.roll();
            if (this.data.hp.toChat)
                r.toMessage({
                    rollMode: "gmroll",
                    flavor: data.name + " rolls for hp!"
                });
            // Make sure hp is at least 1
            const val = Math.max(r.total, 1);
            const hpAttr = "actorData.data.attributes." + this.attr_hp;
            setProperty(data, hpAttr + ".value", val);
            setProperty(data, hpAttr + ".max", val);
        } else
            ui.notifications.warn("Can not randomize hp. HP formula is not set.");
        return;
    }

    registerSettings() {
        // register settings
        game.settings.register("Actor-Hitdice", 'hitdice-enabled-attr', {
            name: "Attribute name enabler",
            hint: "The name of a boolean actor attribute that will decide if actor-hitdice should run for that actor.",
            default: "actor_hitdice_enabled",
            type: String,
            scope: 'world',
            onChange: data => {
                this.attr_enabler = data;
            }
        });

        game.settings.register("Actor-Hitdice", 'hitdice-attr', {
            name: "Attribute name hit dice",
            hint: "The name of a string actor attribute that specifies the roll required to get the hit points of the actor.",
            default: "hitdice",
            type: String,
            scope: 'world',
            onChange: data => {
                this.attr_hitdice = data;
            }
        });

        game.settings.register("Actor-Hitdice", 'hp-attr', {
            name: "Attribute name HP",
            hint: "The name of a int actor attribute that specifies the hp of the actor, which will be modified by the module. It should have a max value too.",
            default: "hp",
            type: String,
            scope: 'world',
            onChange: data => {
                this.attr_hp = data;
            }
        });
    });
}
}
