-- 1) insert new record
SELECT * FROM public.account
ORDER BY account_id ASC;

INSERT INTO public.account (
  account_firstname,
  account_lastname,
  account_email,
  account_password
)
VALUES (
  'Tony',
  'Stark',
  'tony@starkent.com',
  'Iam1ronM@n'
);

--2) Update account_type
UPDATE public.account
SET account_type = 'Admin'
WHERE account_id = 1;

--3) Delete new record
DELETE FROM public.account
WHERE account_id = 1;

--4) Update inv_description
UPDATE public.inventory
SET inv_description = REPLACE(inv_description, 'the small interiors', 'a huge interior')
WHERE inv_make = 'GM';

--5) inner join
SELECT public.inventory.inv_make, public.inventory.inv_model, public.classification.classification_name
FROM public.inventory
INNER JOIN public.classification
  ON public.inventory.classification_id = public.classification.classification_id
WHERE public.classification.classification_name = 'Sport';

--6) Update all records in the inventory table to add "/vehicles"
UPDATE public.inventory
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');
