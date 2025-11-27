export function getGradeColor500(grade: number) {
    return grade >= 400 ? 'bg-green-100 text-green-800' :
        grade >= 350 ? 'bg-blue-100 text-blue-800' :
            grade >= 300 ? 'bg-yellow-100 text-yellow-800' :
                grade >= 250 ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-500'

}

export function getGradeColor100(grade: number) {
    return grade >= 90 ? 'bg-green-100 text-green-800 hover:bg-green-200' :
        grade >= 80 ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
            grade >= 70 ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
                grade >= 60 ? 'bg-orange-100 text-orange-800 hover:bg-orange-200' :
                    grade > 0 ? 'bg-red-100 text-red-800 hover:bg-red-200' :
                        'bg-gray-100 text-gray-800 hover:bg-gray-200'

}