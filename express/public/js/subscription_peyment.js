$(document).ready(() => 
{
  $('#pay').click(submitPayment);
})

function submitPayment(e)
{
  $('#pay').attr('disabled', 'disabled');
  
  let userid = $('#userid').val();
  let tariffid = $('#tariff').val();
  
  let tname = $(`#${tariffid}`).attr('tname');
  let price = $(`#${tariffid}`).attr('price');
  
  let form = { 'userid': userid, 'tariffName': tname, 'tariffid': tariffid, 'price':price };
  
  $.post('/but_ariff', form, onReturnAnswer);
}

function onReturnAnswer(body)
{
  if(body['status'] == 'fail') {
    alert(body['message']);
    $('#pay').removeAttr('disabled');
  }
  else window.location.replace(body['link']);
}