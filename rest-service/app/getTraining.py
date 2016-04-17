def getTraining(emotionsObj):

    trainingCoeffs = {
        "SATPlus": {
            "joy": 0.833,
            "fear": 0.6,
            "sadness": 0.733,
            "disgust": 0.6,
            "anger": 0.7
        },
        "Nback": {
            "joy": 0.833,
            "fear": 0.8,
            "sadness": 0.633,
            "disgust": 0.5,
            "anger": 0.6
        },
        "3DTetris": {
            "joy": 0.667,
            "fear": 0.967,
            "sadness": 0.933,
            "disgust": 0.967,
            "anger": 0.967
        },
        "CPT": {
            "joy": 0.933,
            "fear": 0.333,
            "sadness": 0.533,
            "disgust": 0.267,
            "anger": 0
        },
        "MathProc": {
            "joy": 0.833,
            "fear": 0.6,
            "sadness": 0.567,
            "disgust": 0.433,
            "anger": 0.533
        },
        "MentalRotation": {
            "joy": 0.633,
            "fear": 0.7,
            "sadness": 0.633,
            "disgust": 0.7,
            "anger": 0.533
        },
        "ProgrMatrices": {
            "joy": 0.8,
            "fear": 0.533,
            "sadness": 0.633,
            "disgust": 0.667,
            "anger": 0.667
        }
    }

    extractedEmotions = emotionsObj["document_tone"]["tone_categories"][0]["tones"]

    finalScores = {
        'trainings': [],
        'scores': []
    }
    for tr in trainingCoeffs:
        sum = 0
        c = 0
        for obj in extractedEmotions:
            tone = obj["tone_id"]
            if obj["score"]>0.5:
                sum += trainingCoeffs[tr][tone]*obj["score"]
                c += 1
        finalScores["trainings"].append(tr)
        if c!=0:
            finalScores["scores"].append(sum/c)

    training = ""
    if len(finalScores["scores"]) > 0:
        ind = 0
        maxRes = finalScores["scores"][0]
        training = finalScores["trainings"][0]
        for res in finalScores["scores"]:
            if res > maxRes and res > 0.1:
                maxRes = res
                training = finalScores["trainings"][ind]
            ind += 1


    return training