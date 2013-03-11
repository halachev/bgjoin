/* Bulgarian initialisation for the jQuery UI date picker plugin. */
/* Written by Stoyan Kyosev (http://svest.org). */
jQuery(function($){
    $.datepicker.regional['bg'] = {
        closeText: '�������',
        prevText: '&#x3c;�����',
        nextText: '������&#x3e;',
		nextBigText: '&#x3e;&#x3e;',
        currentText: '����',
        monthNames: ['������','��������','����','�����','���','���',
        '���','������','���������','��������','�������','��������'],
        monthNamesShort: ['���','���','���','���','���','���',
        '���','���','���','���','���','���'],
        dayNames: ['������','����������','�������','�����','���������','�����','������'],
        dayNamesShort: ['���','���','���','���','���','���','���'],
        dayNamesMin: ['��','��','��','��','��','��','��'],
		weekHeader: 'Wk',
        dateFormat: 'dd.mm.yy',
		firstDay: 1,
        isRTL: false,
		showMonthAfterYear: false,
		yearSuffix: ''};
    $.datepicker.setDefaults($.datepicker.regional['bg']);
});
