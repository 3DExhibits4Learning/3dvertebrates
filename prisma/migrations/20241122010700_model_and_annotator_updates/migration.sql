-- AlterTable
ALTER TABLE `model_annotation` MODIFY `annotator` VARCHAR(75) NOT NULL DEFAULT 'Humboldt Vertebrate Museum',
    MODIFY `modeler` VARCHAR(75) NOT NULL DEFAULT 'Humboldt Vertebrate Museum';
