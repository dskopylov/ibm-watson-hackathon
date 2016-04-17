<form action="/" method="POST" style="padding:20px;border:1px solid #eee;margin:10px;">
    {% csrf_token %}
    <textarea name='text' cols=100 rows=8>{{text|escape}}</textarea>
    <br/>
    <input type="submit" value="Отправить">
</form>

<div style="padding:20px;border:1px solid #eee;margin:10px;">
    {{response_text}}
</div>
