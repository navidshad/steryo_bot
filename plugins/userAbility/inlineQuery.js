module.exports = function()
{
    global.fn.eventEmitter.on('inline_query', (InlineQuery) => 
    {
        var results = [
            {
                type:'article',
                id	:'1',
                title:'آزمایش',
                input_message_content:{
                    message_text:'salam khobi',
                },
            }
        ];
        global.robot.bot.answerInlineQuery(InlineQuery.id, results).then();
    });

    global.fn.eventEmitter.on('chosen_inline_result', (ob) => 
    {
        console.log(ob);
    });
};
