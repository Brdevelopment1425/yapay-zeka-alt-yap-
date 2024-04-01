const chalk = require("chalk");

module.exports = {
    name: 'ready',
    execute(client) {

        console.log(chalk.red("[BOT] ") + chalk.green(`${client.user.tag} Başarıyla başlatıldı.`));
    },
};
