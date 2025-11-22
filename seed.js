import { supabase } from './server/supabaseClient.js'

async function seed() {
    const { data, error } = await supabase
        .from('recipes')
        .insert([
            {
                name: '김치볶음밥',
                category: '한식',
                time: '15분',
                ingredients: '밥, 김치, 대파, 간장, 참기름, 계란',
                instructions: "대파와 김치를 썰어 준비한다.\n팬에 기름을 두르고 대파를 볶는다.\n김치를 넣고 볶다가 밥을 넣고 간장으로 간을 맞춘다.\n마지막으로 참기름을 넣고 잘 섞어준다.\n계란 프라이를 올려 마무리한다."
            }
        ])

    if (error) console.error('Error inserting data:', error)
    else console.log('Inserted data:', data)
}

seed()
