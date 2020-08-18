// clinet side javascript file
$(document).ready(()=>{
    $('.delete-article').on('click',(e)=>{
        $target_value = $(e.target);
        const id =($target_value.attr('data-id'));
        $.ajax({
            type:'DELETE',
            url:'/articles/'+id,
            success: (response)=>{
                alert('Deleting The article -->'+id);
                window.location.href='/';
            },
            error: (err)=>{
                console.log(err);
            }
        })
        //console.log(e)

    })
})